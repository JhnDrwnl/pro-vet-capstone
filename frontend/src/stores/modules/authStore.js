// src/stores/modules/authStore.js
import { defineStore } from "pinia"
import { auth, db } from "@shared/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import emailService from "@/services/emailService"
import smsService from "@/services/smsService"


// OTP expiry in seconds (5 minutes)
const OTP_EXPIRY_SECONDS = 300

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    isInitialized: false,
    registrationMethod: null,
    verificationEmail: null,
    rememberMe: false,
    verificationData: null,
    otpSentTimestamp: null,
  }),

  actions: {
    // Helper method to create a proxy URL for Google photos
    getProxyPhotoURL(originalURL) {
      if (!originalURL || !originalURL.startsWith('https://lh3.googleusercontent.com')) {
        return originalURL;
      }
      
      // Use the API endpoint to proxy the Google photo instead of accessing it directly
      return `/api/profile/photo-proxy?url=${encodeURIComponent(originalURL)}`;
    },
    
    // Helper method to check if a URL is a Google photo URL
    isGooglePhotoURL(url) {
      return url && url.startsWith('https://lh3.googleusercontent.com');
    },
    
    // Helper method to check if a URL is a Firebase Storage URL
    isFirebaseStorageURL(url) {
      return url && url.startsWith('https://firebasestorage.googleapis.com');
    },
    
    // Simplified method to handle Google photo URLs
    async processGooglePhotoURL(photoURL) {
      if (!photoURL) return "";
      
      // For Google photos, return a proxied URL
      if (this.isGooglePhotoURL(photoURL)) {
        console.log("Using original Google photo URL:", photoURL);
        return this.getProxyPhotoURL(photoURL);
      }
      
      // For all other photos, return as is
      return photoURL;
    },

    // Method to sync Google profile photos with the server
    async syncGoogleProfilePhoto() {
      try {
        if (!this.user || !this.user.uid) {
          return false;
        }
        
        // Check if the user already has a custom photo
        // If they do, don't sync the Google photo
        const userId = this.generateUserId(this.user.uid);
        const userDoc = await getDoc(doc(db, "users", userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.photoURL && this.isFirebaseStorageURL(userData.photoURL)) {
            return false;
          }
        }
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${API_URL}/profile/sync-google-photo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uid: this.user.uid
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // For Google photos, use a proxy URL for display
          const displayPhotoURL = this.getProxyPhotoURL(data.photoURL);
          
          // Only update the user object if they don't already have a custom photo
          if (!this.user.photoURL || this.isGooglePhotoURL(this.user.originalPhotoURL || '')) {
            this.user = {
              ...this.user,
              photoURL: displayPhotoURL,
              originalPhotoURL: data.photoURL
            };
          }
          
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error('Error syncing Google profile photo:', error);
        return false;
      }
    },

    // Method to get the most up-to-date profile photo
    async getProfilePhoto() {
      try {
        if (!this.user || !this.user.uid) {
          return null;
        }
        
        // Check if the user already has a custom photo
        // If they do, don't fetch a new photo
        if (this.user.photoURL && this.isFirebaseStorageURL(this.user.photoURL)) {
          return this.user.photoURL;
        }
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${API_URL}/profile/photo/${this.user.uid}`);
        const data = await response.json();
        
        if (data.success) {
          // If the photo is from Firebase Storage, use it directly
          if (this.isFirebaseStorageURL(data.photoURL)) {
            this.user = {
              ...this.user,
              photoURL: data.photoURL,
              originalPhotoURL: data.photoURL
            };
            return data.photoURL;
          }
          
          // For Google photos, use a proxy URL for display
          const displayPhotoURL = this.getProxyPhotoURL(data.photoURL);
          
          // Update the local user object with the fetched photo URL
          if (data.photoURL) {
            this.user = {
              ...this.user,
              photoURL: displayPhotoURL,
              originalPhotoURL: data.photoURL
            };
          }
          
          return displayPhotoURL;
        } else {
          return null;
        }
      } catch (error) {
        console.error('Error getting profile photo:', error);
        return null;
      }
    },

    generateUserId(uid) {
      return `user_${uid.substring(0, 8)}`
    },

    async initializeAuth() {
      return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
          auth,
          async (user) => {
            if (user) {
              await this.fetchUserData(user)
              
              // Only get the profile photo if the user doesn't have a custom photo
              if ((!this.user.photoURL || this.isGooglePhotoURL(this.user.originalPhotoURL || '')) && 
                  user.photoURL && this.isGooglePhotoURL(user.photoURL)) {
                await this.getProfilePhoto();
              }
            } else {
              this.user = null
            }
            this.isInitialized = true
            unsubscribe()
            resolve()
          },
          (error) => {
            this.error = error.message
            this.isInitialized = true
            reject(error)
          },
        )
      })
    },

    async fetchUserData(user) {
      const userId = this.generateUserId(user.uid);
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Get the current Google photoURL if it exists
        const googlePhotoURL = user.photoURL && this.isGooglePhotoURL(user.photoURL) 
          ? user.photoURL 
          : null;
        
        // Determine which photoURL to use with a clear priority order:
        // 1. If user has a custom photo in Firestore (Firebase Storage), use that
        // 2. If user has a Google photo from auth, use that (it's the most current)
        // 3. If user has a Google photo stored in Firestore, use that
        // 4. Otherwise, use empty string
        let photoURL = '';
        let originalPhotoURL = '';
        let shouldUpdateFirestore = false;
        
        // Case 1: User has a custom photo (Firebase Storage)
        if (userData.photoURL && this.isFirebaseStorageURL(userData.photoURL)) {
          photoURL = userData.photoURL;
          originalPhotoURL = userData.photoURL;
        }
        // Case 2: User has a current Google photo from auth
        else if (googlePhotoURL) {
          originalPhotoURL = googlePhotoURL;
          photoURL = this.getProxyPhotoURL(googlePhotoURL);
          
          // Update Firestore if the stored URL is different or missing
          if (userData.photoURL !== googlePhotoURL) {
            shouldUpdateFirestore = true;
          }
        }
        // Case 3: User has a stored Google photo in Firestore
        else if (userData.photoURL && this.isGooglePhotoURL(userData.photoURL)) {
          originalPhotoURL = userData.photoURL;
          photoURL = this.getProxyPhotoURL(userData.photoURL);
        }
        
        // Update Firestore if needed
        if (shouldUpdateFirestore && googlePhotoURL && !this.isFirebaseStorageURL(userData.photoURL)) {
          try {
            await updateDoc(doc(db, "users", userId), { 
              photoURL: googlePhotoURL,
              updatedAt: new Date()
            });
          } catch (error) {
            console.error("Error updating photoURL in Firestore:", error);
          }
        }
        
        this.user = {
          ...user,
          userId: userId,
          role: userData.role,
          status: userData.status,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: user.email || userData.email,
          photoURL: photoURL, // Use the proxied/processed URL for display
          originalPhotoURL: originalPhotoURL // Keep original URL for reference
        };
      } else {
        console.error("User document not found");
        this.user = null;
      }
    },

    async createUserDocument(user, additionalData = {}) {
      if (!user) return

      const userId = this.generateUserId(user.uid)
      const userRef = doc(db, "users", userId)
      
      // Process photoURL for storage (store the original URL)
      let photoURL = user.photoURL || additionalData.photoURL || ""
      
      const userData = {
        email: user.email,
        uid: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: additionalData.role || "user",
        status: additionalData.status || "pending",
        firstName: additionalData.firstName || "",
        lastName: additionalData.lastName || "",
        photoURL: photoURL, // Store the original URL
        emailVerified: false,
        ...additionalData,
      }

      try {
        await setDoc(userRef, userData)
        console.log("User document created successfully")
        return userId
      } catch (error) {
        console.error("Error creating user document:", error)
        throw error
      }
    },

    async signInWithGoogle({ isRegistration = false, onNewUser = () => {} } = {}) {
      this.loading = true
      this.error = null
      try {
        const provider = new GoogleAuthProvider()
        provider.addScope("email")
        provider.addScope("profile")
        const result = await signInWithPopup(auth, provider)
        const user = result.user

        // Parse the user's name
        const nameParts = user.displayName ? user.displayName.split(" ") : ["", ""]
        let firstName, lastName

        if (nameParts.length >= 2) {
          lastName = nameParts.pop()
          firstName = nameParts.join(" ")
        } else {
          firstName = nameParts[0] || ""
          lastName = ""
        }

        // Use the original photo URL directly - don't split it
        const photoURL = user.photoURL || ""

        const additionalUserInfo = getAdditionalUserInfo(result)
        const isNewUser = additionalUserInfo?.isNewUser

        const userId = this.generateUserId(user.uid)
        const userDoc = await getDoc(doc(db, "users", userId))

        if (!userDoc.exists() || isNewUser) {
          // Call the onNewUser callback
          onNewUser()

          // For new Google users, require phone verification
          console.log('New Google user detected - requiring phone verification')
          
          // Create user document in Firestore with pending status
          await this.createUserDocument(user, {
            firstName,
            lastName,
            phone: '', // Empty phone until verified
            role: "user",
            status: "pending", // Set to pending until phone verification
            emailVerified: true, // Google emails are already verified
            phoneVerified: false, // Require phone verification
            registrationMethod: "google",
            photoURL: photoURL
          })
          
          // Update the local user object
          if (this.user) {
            this.user.status = "pending"
            this.user.phoneVerified = false
            this.user.registrationMethod = "google"
            this.user.emailVerified = true
          }
          
          // Store verification data for phone verification
          this.setVerificationData({
            uid: user.uid,
            firstName,
            lastName,
            email: user.email,
            photoURL: photoURL,
            role: "user",
            status: "pending",
            emailVerified: true,
            phoneVerified: false,
            registrationMethod: "google",
            timestamp: Date.now()
          })
          
          // Return special flag to indicate phone verification is needed
          return { needsPhoneVerification: true, user }
        } else {
          // For existing users with Google accounts, only update the photoURL
          // if they don't have a custom photo
          const userData = userDoc.data();
          
          // Only update if the user doesn't have a custom photo
          if (photoURL && (!userData.photoURL || this.isGooglePhotoURL(userData.photoURL))) {
            await updateDoc(doc(db, "users", userId), {
              photoURL: photoURL, // Use the complete URL
              updatedAt: new Date()
            });
          }
          
          // Update local user object with existing data
          if (this.user) {
            this.user.status = userData.status || "active"
            this.user.phoneVerified = userData.phoneVerified || false
            this.user.registrationMethod = "google"
          }
        }

        await this.fetchUserData(user)
        
        // Only sync the Google photo if the user doesn't have a custom photo
        if (user.photoURL && this.isGooglePhotoURL(user.photoURL) && 
            (!this.user.photoURL || !this.isFirebaseStorageURL(this.user.photoURL))) {
          await this.syncGoogleProfilePhoto();
        }
        
        this.registrationMethod = "google"
        
        // Set registration method in user object for easier access
        if (this.user) {
          this.user.registrationMethod = "google"
        }
        
        console.log("Google sign-in successful")
        
        // Check if this is a new user that needs phone verification
        if (this.user && this.user.status === "pending" && !this.user.phoneVerified) {
          return { needsPhoneVerification: true, user: this.user }
        }
        
        return true
      } catch (error) {
        // Handle specific Google authentication errors
        let errorMessage = 'Something went wrong. Please try again.';
        
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = 'Sign-in was cancelled. Please try again.';
        } else if (error.code === 'auth/popup-blocked') {
          errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
        } else if (error.code === 'auth/cancelled-popup-request') {
          errorMessage = 'Sign-in was cancelled. Please try again.';
        } else if (error.code === 'auth/account-exists-with-different-credential') {
          errorMessage = 'An account already exists with this email using a different sign-in method.';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMessage = 'Google sign-in is not enabled. Please contact support.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed attempts. Please try again later.';
        }
        
        this.error = errorMessage;
        console.error("Google sign-in error:", error);
        return false;
      } finally {
        this.loading = false
      }
    },

    // The rest of the methods remain unchanged
    setVerificationData(data) {
      this.verificationData = data
      // Store in localStorage as a backup
      if (data) {
        localStorage.setItem(
          "verificationData",
          JSON.stringify({
            ...data,
            timestamp: Date.now(),
          }),
        )
      }
    },

    getVerificationData() {
      // If we don't have verification data in state, try to get from localStorage
      if (!this.verificationData) {
        const storedData = localStorage.getItem("verificationData")
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData)
            // Check if the data is still valid (less than 5 minutes old)
            if (parsedData && Date.now() - parsedData.timestamp < 5 * 60 * 1000) {
              this.verificationData = parsedData
            }
          } catch (e) {
            console.error("Error parsing stored verification data", e)
          }
        }
      }
      return this.verificationData
    },

    clearVerificationData() {
      this.verificationData = null
      localStorage.removeItem("verificationData")
    },

    async initiateRegistration({ email, phone, password, firstName, lastName }) {
      this.loading = true
      this.error = null
      try {
        // Create user in Firebase Auth first
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Store verification data
        this.setVerificationData({
          email,
          phone,
          password,
          firstName,
          lastName,
          uid: user.uid,
          role: "user",
          status: "pending",
        })

        // Create user document in Firestore with pending status immediately
        await this.createUserDocument(user, {
          firstName,
          lastName,
          phone,
          role: "user",
          status: "pending",
        })

        // Send OTP using Node.js backend
        await emailService.sendOTP(email, firstName)

        // Store the timestamp when OTP was sent
        this.otpSentTimestamp = Date.now()
        localStorage.setItem("otpSentTimestamp", this.otpSentTimestamp.toString())

        // Sign out until verification is complete
        await this.logoutUser()

        return true
      } catch (error) {
        // Handle specific Firebase authentication errors
        let errorMessage = 'Something went wrong. Please try again.';
        
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password is too weak. Please choose a stronger password (at least 6 characters).';
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed attempts. Please try again later.';
        }
        
        this.error = errorMessage;
        console.error("Registration initiation error:", error);
        throw new Error(errorMessage);
      } finally {
        this.loading = false
      }
    },

    async completeRegistration(otp) {
      this.loading = true
      this.error = null
      try {
        const verificationData = this.getVerificationData()
        if (!verificationData) {
          throw new Error("No verification data found")
        }

        console.log('Starting email verification with data:', verificationData)

        // Verify OTP using Node.js backend
        const response = await emailService.verifyOTP(verificationData.email, otp)

        if (!response.success || !response.valid) {
          throw new Error(response.message || "Invalid verification code")
        }

        console.log('Email OTP verified successfully, updating Firestore...')

        // Update existing user document status to email verified
        const userId = this.generateUserId(verificationData.uid)
        const userRef = doc(db, "users", userId)

        await setDoc(
          userRef,
          {
            emailVerified: true,
            updatedAt: new Date(),
          },
          { merge: true },
        )

        console.log('Firestore updated with emailVerified: true')

        // Don't clear verification data yet - we need it for phone verification
        // Just update the status to indicate email is verified
        this.verificationData.emailVerified = true
        
        // Also update the stored verification data in localStorage
        this.setVerificationData(this.verificationData)
        
        console.log('Verification data updated with emailVerified: true:', this.verificationData)

        return true
      } catch (error) {
        // Handle specific errors with better messages
        let errorMessage = 'Something went wrong. Please try again.';
        
        if (error.message.includes('Invalid verification code')) {
          errorMessage = 'Invalid verification code. Please check your email and try again.';
        } else if (error.message.includes('No verification data found')) {
          errorMessage = 'Verification session expired. Please start registration again.';
        } else if (error.message.includes('verification code')) {
          errorMessage = error.message;
        }
        
        this.error = errorMessage;
        console.error("Registration completion error:", error);
        throw new Error(errorMessage);
      } finally {
        this.loading = false
      }
    },

    async sendPhoneOTP(phone, method = 'sms') {
      this.loading = true
      this.error = null
      try {
        let result
        
                // Generate OTP
        const otp = smsService.generateOTP()
        
        // Send SMS OTP using PhilSMS
        result = await smsService.sendOTP(phone, otp)
        
        if (result.success) {
          // Get or create verification data for storing the SMS OTP
          let verificationData = this.getVerificationData()
          
          // If no verification data exists, create a basic one
          if (!verificationData) {
            verificationData = {
              phone: phone,
              method: method,
              timestamp: Date.now()
            }
          }
          
          // Store the SMS OTP in verification data
          verificationData.smsOTP = otp
          verificationData.phone = phone
          verificationData.method = method
          this.setVerificationData(verificationData)
          
          // Store the timestamp when SMS OTP was sent
          this.otpSentTimestamp = Date.now()
          localStorage.setItem("otpSentTimestamp", this.otpSentTimestamp.toString())
          
          console.log('SMS OTP sent successfully')
          return true
        }
        
        throw new Error(`Failed to send ${method.toUpperCase()} OTP`)
      } catch (error) {
        // Handle specific errors with better messages
        let errorMessage = 'Something went wrong. Please try again.';
        
        if (error.message.includes('Failed to send')) {
          errorMessage = `Failed to send ${method.toUpperCase()} verification code. Please try again.`;
        } else if (error.message.includes('phone')) {
          errorMessage = 'Invalid phone number. Please check and try again.';
        }
        
        this.error = errorMessage;
        console.error(`${method.toUpperCase()} OTP sending error:`, error);
        throw new Error(errorMessage);
      } finally {
        this.loading = false
      }
    },

    async completePhoneVerification(otp) {
      this.loading = true
      this.error = null
      try {
        const verificationData = this.getVerificationData()
        if (!verificationData) {
          throw new Error("No verification data found")
        }

        // Check if SMS OTP exists
        if (!verificationData.smsOTP) {
          throw new Error("No SMS OTP found. Please request a new verification code.")
        }

        // Verify the OTP (SMS)
        if (verificationData.smsOTP === otp) {
          // Get the user ID - either from verification data or generate it
          let userId
          if (verificationData.uid) {
            userId = this.generateUserId(verificationData.uid)
          } else {
            throw new Error("User UID not found in verification data")
          }

          const userRef = doc(db, "users", userId)

          // Check if user document exists
          const userDoc = await getDoc(userRef)
          
          if (userDoc.exists()) {
            // Update existing user document with phone verification
            await setDoc(
              userRef,
              {
                phoneVerified: true,
                phone: verificationData.phone,
                updatedAt: new Date(),
              },
              { merge: true },
            )
            
            // If both email and phone are verified, update status to active
            const userData = userDoc.data()
            if (userData.emailVerified && verificationData.emailVerified) {
              await setDoc(
                userRef,
                {
                  status: "active",
                  updatedAt: new Date(),
                },
                { merge: true },
              )
              console.log('User status updated to active after complete verification')
            }
          } else {
            // Create new user document if it doesn't exist
            await setDoc(
              userRef,
              {
                email: verificationData.email || '',
                firstName: verificationData.firstName || '',
                lastName: verificationData.lastName || '',
                phone: verificationData.phone,
                role: verificationData.role || "user",
                status: verificationData.emailVerified ? "pending" : "pending",
                emailVerified: verificationData.emailVerified || false,
                phoneVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                uid: verificationData.uid
              },
              { merge: true },
            )
            console.log('New user document created with phone verification')
          }

          // Clear verification data since phone verification is complete
          this.clearVerificationData()
          localStorage.removeItem("otpSentTimestamp")

          console.log('Phone verification completed successfully')
          return true
        } else {
          throw new Error("Invalid SMS verification code")
        }
      } catch (error) {
        this.error = `Something went wrong. Please try again.`
        console.error("Phone verification completion error:", error)
        throw new Error(error.message || 'Something went wrong. Please try again.')
      } finally {
        this.loading = false
      }
    },

        // Method to handle phone verification for Google users
    async completeGooglePhoneVerification(otp, phone) {
      this.loading = true
      this.error = null
      try {
        // For Google users, we need to check the stored OTP from verification data
        const verificationData = this.getVerificationData()
        if (!verificationData) {
          throw new Error("No verification data found")
        }

        // Verify the OTP (SMS)
        if (verificationData.smsOTP && verificationData.smsOTP === otp) {

          // Create or update user document with complete information
          const userId = this.generateUserId(this.user.uid)
          const userRef = doc(db, "users", userId)

          // Get user data from verification data or use defaults
          const userData = {
            firstName: verificationData.firstName || this.user?.displayName?.split(' ')[0] || '',
            lastName: verificationData.lastName || this.user?.displayName?.split(' ').slice(1).join(' ') || '',
            email: this.user?.email || '',
            photoURL: this.user?.photoURL || '',
            role: "user",
            status: "active",
            emailVerified: true,
            phoneVerified: true,
            phone: phone,
            registrationMethod: "google",
            createdAt: new Date(),
            updatedAt: new Date(),
            uid: this.user?.uid || ''
          }

          await setDoc(userRef, userData)

          // Clear verification data
          this.clearVerificationData()
          localStorage.removeItem("otpSentTimestamp")

          // Update local user state
          if (this.user) {
            this.user.phone = phone
            this.user.phoneVerified = true
            this.user.status = "active"
          }

          console.log('Google user phone verification completed successfully')
          return true
        } else {
          throw new Error("Invalid verification code")
        }
      } catch (error) {
        this.error = `Something went wrong. Please try again.`
        console.error("Google phone verification completion error:", error)
        throw new Error(error.message || 'Something went wrong. Please try again.')
      } finally {
        this.loading = false
      }
    },

    // Method to update user phone number
    async updateUserPhone(phone) {
      try {
        if (!this.user || !this.user.uid) {
          throw new Error("No authenticated user found")
        }

        const userId = this.generateUserId(this.user.uid)
        const userRef = doc(db, "users", userId)

        await setDoc(
          userRef,
          {
            phone: phone,
            updatedAt: new Date(),
          },
          { merge: true },
        )

        // Update local user state
        if (this.user) {
          this.user.phone = phone
          this.user.phoneVerified = true
          this.user.status = "active"
        }

        console.log('User phone number updated successfully')
        return true
      } catch (error) {
        console.error("Error updating user phone:", error)
        throw new Error('Something went wrong. Please try again.')
      }
    },

    // Method to check if Google user needs phone verification
    async needsPhoneVerification() {
      if (!this.user) {
        console.log('needsPhoneVerification: No user found')
        return false
      }
      
      console.log('needsPhoneVerification: Checking user:', {
        registrationMethod: this.registrationMethod,
        providerData: this.user.providerData,
        phoneVerified: this.user.phoneVerified,
        status: this.user.status
      })
      
      // Check if user is a Google user
      const isGoogleUser = this.registrationMethod === "google" || 
                          this.user.providerData?.some(p => p.providerId === 'google.com')
      
      if (!isGoogleUser) {
        console.log('needsPhoneVerification: Not a Google user')
        return false
      }
      
      // TEMPORARILY DISABLED: Phone verification for Google users
      // Always return false to skip phone verification
      console.log('needsPhoneVerification: Phone verification temporarily disabled for Google users')
      return false
      
      // Check if user document exists in Firestore
      try {
        const userId = this.generateUserId(this.user.uid)
        const userRef = doc(db, "users", userId)
        const userDoc = await getDoc(userRef)
        
        if (!userDoc.exists()) {
          console.log('needsPhoneVerification: User document does not exist - needs phone verification')
          return true
        }
        
        // If user document exists, check if they need phone verification
        const userData = userDoc.data()
        const needsVerification = !userData.phoneVerified || 
                                 userData.status === "pending_phone_verification"
        
        console.log('needsPhoneVerification: User document exists, needs verification:', needsVerification)
        return needsVerification
        
      } catch (error) {
        console.error('needsPhoneVerification: Error checking user document:', error)
        return false
      }
    },

    // Method to send OTP for Google users (without requiring email verification first)
    async sendGooglePhoneOTP(phone, method = 'sms') {
      this.loading = true
      this.error = null
      try {
        let result
        
        // Generate OTP
        const otp = smsService.generateOTP()
        
        // Send SMS OTP using PhilSMS
        result = await smsService.sendOTP(phone, otp)
        
        if (result.success) {
          // Get existing verification data or create new one
          let verificationData = this.getVerificationData() || {}
          
          // Update verification data with phone and OTP
          verificationData.smsOTP = otp
          verificationData.phone = phone
          verificationData.method = method
          verificationData.timestamp = Date.now()
          
          // If we don't have user details yet, try to get them from the current user
          if (!verificationData.firstName && this.user?.displayName) {
            const nameParts = this.user.displayName.split(' ')
            verificationData.firstName = nameParts[0] || ''
            verificationData.lastName = nameParts.slice(1).join(' ') || ''
          }
          
          this.setVerificationData(verificationData)

          // Store the timestamp when SMS OTP was sent
          this.otpSentTimestamp = Date.now()
          localStorage.setItem("otpSentTimestamp", this.otpSentTimestamp.toString())

          console.log('SMS OTP sent successfully for Google user')
          return { success: true, message: 'Verification code sent successfully' }
        }
        
        throw new Error(`Failed to send ${method.toUpperCase()} OTP`)
      } catch (error) {
        this.error = `Something went wrong. Please try again.`
        console.error(`${method.toUpperCase()} OTP sending error for Google user:`, error)
        throw new Error('Something went wrong. Please try again.')
      } finally {
        this.loading = false
      }
    },

    async loginUser({ email, password, rememberMe }) {
      this.loading = true
      this.error = null

      // Maximum number of retry attempts
      const maxRetries = 3
      let retryCount = 0

      const attemptLogin = async () => {
        try {
          await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)

          const userCredential = await signInWithEmailAndPassword(auth, email, password)
          const user = userCredential.user

          // Get user data from Firestore
          const userId = this.generateUserId(user.uid)
          const userDoc = await getDoc(doc(db, "users", userId))

          if (!userDoc.exists()) {
            await signOut(auth)
            throw new Error("User data not found")
          }

          const userData = userDoc.data()

          // Check if user is verified
          if (userData.status === "pending" || !userData.emailVerified) {
            await signOut(auth)

            // Store verification data for the OTP process
            this.setVerificationData({
              email,
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              uid: user.uid,
              role: userData.role || "user",
              status: "pending",
            })

            this.error = "Please verify your email before logging in."
            this.user = null
            return { success: false, emailVerificationRequired: true }
          }

          await this.fetchUserData(user)

          this.rememberMe = rememberMe
          if (rememberMe) {
            localStorage.setItem("rememberMe", "true")
            localStorage.setItem("userEmail", email)
          } else {
            localStorage.removeItem("rememberMe")
            localStorage.removeItem("userEmail")
          }

          return { success: true }
        } catch (error) {
          // Check if this is the visibility check error
          if (error.code === "auth/visibility-check-was-unavailable" && retryCount < maxRetries) {
            console.log(`Visibility check error, retrying (${retryCount + 1}/${maxRetries})...`)
            retryCount++

            // Wait for a short delay before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return await attemptLogin()
          }

          this.error = `Something went wrong. Please try again.`
          console.error("Login error:", error)

          // Return specific error type for invalid credentials
          if (
            error.code === "auth/invalid-credential" ||
            error.code === "auth/user-not-found" ||
            error.code === "auth/wrong-password"
          ) {
            this.error = "Invalid email or password. Please check your credentials and try again.";
            return { success: false, invalidCredentials: true }
          } else if (error.code === "auth/user-disabled") {
            this.error = "This account has been disabled. Please contact support.";
          } else if (error.code === "auth/too-many-requests") {
            this.error = "Too many failed login attempts. Please try again later.";
          } else if (error.code === "auth/network-request-failed") {
            this.error = "Network error. Please check your internet connection and try again.";
          } else if (error.code === "auth/operation-not-allowed") {
            this.error = "Email/password accounts are not enabled. Please contact support.";
          }

          return { success: false, errorCode: error.code }
        }
      }

      try {
        return await attemptLogin()
      } finally {
        this.loading = false
      }
    },

    async logoutUser() {
      this.loading = true
      this.error = null
      try {
        await signOut(auth)
        this.user = null
        this.registrationMethod = null
        this.rememberMe = false
        localStorage.removeItem("rememberMe")
        localStorage.removeItem("userEmail")
      } catch (error) {
        this.error = `Something went wrong. Please try again.`
        console.error("Logout error:", error)
      } finally {
        this.loading = false
      }
    },

    async resendVerificationEmail(email) {
      try {
        this.loading = true

        const verificationData = this.getVerificationData()
        if (!verificationData && !email) {
          throw new Error("No verification data found")
        }

        const verificationEmail = email || verificationData.email
        const firstName = verificationData?.firstName || ""

        // Use Firebase Cloud Function to resend OTP
        const response = await emailService.resendOTP(verificationEmail, firstName)

        if (response.success) {
          // Update the timestamp when OTP was sent
          this.otpSentTimestamp = Date.now()
          localStorage.setItem("otpSentTimestamp", this.otpSentTimestamp.toString())
          return true
        } else {
          throw new Error(response.message || "Failed to resend verification code")
        }
      } catch (error) {
        console.error("Error resending verification email:", error)
        this.error = `Something went wrong. Please try again.`
        throw new Error('Something went wrong. Please try again.')
      } finally {
        this.loading = false
      }
    },

    async sendPasswordResetOTP(email) {
      this.loading = true
      this.error = null
      try {
        // Send password reset OTP via Firebase Cloud Function
        await emailService.sendPasswordResetOTP(email)

        // Store email for later steps
        this.setPasswordResetData({ email })

        // Store the timestamp when OTP was sent
        this.otpSentTimestamp = Date.now()
        localStorage.setItem("otpSentTimestamp", this.otpSentTimestamp.toString())

        return true
      } catch (error) {
        this.error = `Something went wrong. Please try again.`
        console.error("Password reset initiation error:", error)
        throw new Error('Something went wrong. Please try again.')
      } finally {
        this.loading = false
      }
    },

    async verifyPasswordResetOTP(email, otp) {
      this.loading = true
      this.error = null
      try {
        // Verify OTP specifically for password reset
        const response = await emailService.verifyOTP(email, otp, "password-reset")

        if (response.success) {
          // Store the OTP for the final password reset step
          this.setPasswordResetData({ email, otp })
          return response
        }

        throw new Error(response.message || "Invalid verification code")
      } catch (error) {
        this.error = `Something went wrong. Please try again.`
        console.error("OTP verification error:", error)
        throw new Error('Something went wrong. Please try again.')
      } finally {
        this.loading = false
      }
    },

    async resetPasswordWithEmail(email, otp, newPassword) {
      this.loading = true
      this.error = null
      try {
        if (!email || !otp || !newPassword) {
          throw new Error("Missing required information for password reset")
        }

        // Call the email service to reset the password
        const result = await emailService.resetPasswordWithOTP(email, otp, newPassword)

        // Clear verification data
        this.clearVerificationData()
        localStorage.removeItem("otpSentTimestamp")

        return result
      } catch (error) {
        this.error = `Something went wrong. Please try again.`
        console.error("Password reset error:", error)
        throw new Error('Something went wrong. Please try again.')
      } finally {
        this.loading = false
      }
    },

    setPasswordResetData(data) {
      this.verificationData = {
        ...this.verificationData,
        ...data,
        purpose: "password-reset",
      }
    },

    checkRememberMe() {
      const rememberMe = localStorage.getItem("rememberMe")
      if (rememberMe === "true") {
        this.rememberMe = true
        return localStorage.getItem("userEmail") || ""
      }
      return ""
    },

    // Check SMS balance
    async checkSMSBalance() {
      try {
        const result = await smsService.getBalance()
        return result
      } catch (error) {
        console.error("Error checking SMS balance:", error)
        throw error
      }
    },


  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role || null,
    userStatus: (state) => state.user?.status || null,
    isPending: (state) => state.user?.status === "pending",
    isActive: (state) => state.user?.status === "active",

    otpRemainingTime: (state) => {
      if (!state.otpSentTimestamp) {
        // Try to get from localStorage
        const storedTimestamp = localStorage.getItem("otpSentTimestamp")
        if (storedTimestamp) {
          state.otpSentTimestamp = Number.parseInt(storedTimestamp)
        } else {
          return 0
        }
      }

      // OTP expires after 5 minutes (300 seconds)
      const expiryTime = state.otpSentTimestamp + OTP_EXPIRY_SECONDS * 1000
      const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000))
      return remaining
    },
  },
})