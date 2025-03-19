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
        
        // Clean and process the photoURL
        let photoURL = user.photoURL || userData.photoURL || "";
        
        // If it's a Google photo URL, remove any size parameters
        if (photoURL && photoURL.startsWith('https://lh3.googleusercontent.com')) {
          const cleanPhotoURL = photoURL.split('=')[0];
          
          // If the stored URL is different from the clean one, update it
          if (userData.photoURL !== cleanPhotoURL) {
            console.log("Updating photoURL in fetchUserData:", cleanPhotoURL);
            await updateDoc(doc(db, "users", userId), { 
              photoURL: cleanPhotoURL,
              updatedAt: new Date()
            });
          }
          
          photoURL = cleanPhotoURL;
        }
        
        this.user = {
          ...user,
          userId: userId,
          role: userData.role,
          status: userData.status,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: user.email || userData.email,
          photoURL: photoURL, // Use the cleaned URL
        };
        
        console.log("User data fetched with photo URL:", photoURL);
      } else {
        console.error("User document not found");
        this.user = null;
      }
    },

    async createUserDocument(user, additionalData = {}) {
      if (!user) return

      const userId = this.generateUserId(user.uid)
      const userRef = doc(db, "users", userId)
      
      // Process photoURL to ensure it's clean
      let photoURL = user.photoURL || additionalData.photoURL || ""
      
      // If it's a Google photo URL, remove any size parameters
      if (photoURL && photoURL.startsWith('https://lh3.googleusercontent.com')) {
        photoURL = photoURL.split('=')[0]
      }
      
      const userData = {
        email: user.email,
        uid: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: additionalData.role || "user",
        status: additionalData.status || "pending",
        firstName: additionalData.firstName || "",
        lastName: additionalData.lastName || "",
        photoURL: photoURL,
        emailVerified: false,
        ...additionalData,
      }

      try {
        await setDoc(userRef, userData)
        console.log("User document created successfully with ID:", userId)
        console.log("Stored user data:", userData)
        return userId
      } catch (error) {
        console.error("Error creating user document:", error)
        throw error
      }
    },

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

    async initiateRegistration({ email, password, firstName, lastName }) {
      this.loading = true
      this.error = null
      try {
        // Create user in Firebase Auth first
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Store verification data
        this.setVerificationData({
          email,
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
          role: "user",
          status: "pending",
        })

        // Send OTP using Nodemailer service
        await emailService.sendOTP(email, firstName)

        // Store the timestamp when OTP was sent
        this.otpSentTimestamp = Date.now()
        localStorage.setItem("otpSentTimestamp", this.otpSentTimestamp.toString())

        // Sign out until verification is complete
        await this.logoutUser()

        return true
      } catch (error) {
        this.error = error.message
        console.error("Registration initiation error:", error)
        throw error
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

        // Verify OTP using Nodemailer service
        const response = await emailService.verifyOTP(verificationData.email, otp)

        if (!response.success || !response.valid) {
          throw new Error(response.message || "Invalid verification code")
        }

        // Update existing user document status to active
        const userId = this.generateUserId(verificationData.uid)
        const userRef = doc(db, "users", userId)

        await setDoc(
          userRef,
          {
            status: "active",
            emailVerified: true,
            updatedAt: new Date(),
          },
          { merge: true },
        )

        // Clear verification data
        this.clearVerificationData()
        localStorage.removeItem("otpSentTimestamp")

        return true
      } catch (error) {
        this.error = error.message
        console.error("Registration completion error:", error)
        throw error
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

          this.error = error.message
          console.error("Login error:", error)

          // Return specific error type for invalid credentials
          if (
            error.code === "auth/invalid-credential" ||
            error.code === "auth/user-not-found" ||
            error.code === "auth/wrong-password"
          ) {
            return { success: false, invalidCredentials: true }
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
        this.error = error.message
        console.error("Logout error:", error)
      } finally {
        this.loading = false
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

        console.log("Google sign-in user:", user)
        console.log("User email:", user.email)
        console.log("User display name:", user.displayName)
        console.log("User photo URL:", user.photoURL)
        console.log("User UID:", user.uid)

        // Always clean the photoURL immediately when we get it from Google
        let photoURL = user.photoURL || ""
        if (photoURL && photoURL.startsWith('https://lh3.googleusercontent.com')) {
          // Remove any size parameters and make sure we get the full-size image
          photoURL = photoURL.split('=')[0]
          console.log("Cleaned photoURL from Google:", photoURL)
          // Update the user object with the cleaned URL
          user.photoURL = photoURL
        }

        const additionalUserInfo = getAdditionalUserInfo(result)
        const isNewUser = additionalUserInfo?.isNewUser
        console.log("Is new user:", isNewUser)

        const userId = this.generateUserId(user.uid)
        const userDoc = await getDoc(doc(db, "users", userId))

        if (!userDoc.exists() || isNewUser) {
          // Call the onNewUser callback
          onNewUser()

          const nameParts = user.displayName ? user.displayName.split(" ") : ["", ""]
          let firstName, lastName

          if (nameParts.length >= 2) {
            lastName = nameParts.pop()
            firstName = nameParts.join(" ")
          } else {
            firstName = nameParts[0] || ""
            lastName = ""
          }

          console.log("Parsed firstName:", firstName)
          console.log("Parsed lastName:", lastName)

          // Create user document with status based on where the sign-in was initiated
          await this.createUserDocument(user, {
            firstName,
            lastName,
            photoURL: photoURL,
            email: user.email || additionalUserInfo?.profile?.email || "",
            role: "user",
            status: "active", // Always set as active for Google sign-in
            emailVerified: true,
          })
        } else {
          // For existing users, ensure the photoURL is up to date
          const userData = userDoc.data()
          
          // Update the photoURL if it has changed
          if (photoURL && (!userData.photoURL || userData.photoURL !== photoURL)) {
            console.log("Updating photoURL for existing user:", photoURL)
            
            await updateDoc(doc(db, "users", userId), {
              photoURL: photoURL,
              updatedAt: new Date()
            });
          }
        }

        await this.fetchUserData(user)
        this.registrationMethod = "google"
        console.log("Google sign-in successful")
        return true
      } catch (error) {
        this.error = error.message
        console.error("Google sign-in error:", error)
        return false
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

        // Use Nodemailer service to resend OTP
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
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // New method for OTP-based password reset
    /**
     * Send password reset OTP
     * @param {string} email - User's email
     */
    async sendPasswordResetOTP(email) {
      this.loading = true
      this.error = null
      try {
        // Send password reset OTP via email service
        await emailService.sendPasswordResetOTP(email)

        // Store email for later steps
        this.setPasswordResetData({ email })

        // Store the timestamp when OTP was sent
        this.otpSentTimestamp = Date.now()
        localStorage.setItem("otpSentTimestamp", this.otpSentTimestamp.toString())

        return true
      } catch (error) {
        this.error = error.message
        console.error("Password reset initiation error:", error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Verify password reset OTP
    /**
     * Verify password reset OTP
     * @param {string} email - User's email
     * @param {string} otp - One-time password
     * @returns {Promise<boolean>} - True if OTP is valid
     */
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
        this.error = error.message
        console.error("OTP verification error:", error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Complete password reset with new password
    /**
     * Reset password with email and OTP
     * @param {string} email - User's email
     * @param {string} otp - One-time password
     * @param {string} newPassword - New password
     */
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
        this.error = error.response?.data?.message || error.message
        console.error("Password reset error:", error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Store data for password reset process
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
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role || null,
    userStatus: (state) => state.user?.status || null,
    isPending: (state) => state.user?.status === "pending",
    isActive: (state) => state.user?.status === "active",

    // New getter to calculate remaining OTP time
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