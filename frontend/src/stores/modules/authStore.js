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
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import emailService from "@/services/emailService"

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
      const userId = this.generateUserId(user.uid)
      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        this.user = {
          ...user,
          userId: userId,
          role: userData.role,
          status: userData.status,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: user.email || userData.email,
          photoURL: user.photoURL || userData.photoURL,
        }
      } else {
        console.error("User document not found")
        this.user = null
      }
    },

    async createUserDocument(user, additionalData = {}) {
      if (!user) return

      const userId = this.generateUserId(user.uid)
      const userRef = doc(db, "users", userId)
      const userData = {
        email: user.email,
        uid: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: additionalData.role || "user",
        status: additionalData.status || "pending",
        firstName: additionalData.firstName || "",
        lastName: additionalData.lastName || "",
        photoURL: user.photoURL || additionalData.photoURL || "",
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
    },

    getVerificationData() {
      return this.verificationData
    },

    clearVerificationData() {
      this.verificationData = null
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

        // Send OTP
        await emailService.sendOTP(email, firstName)

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
        if (!this.verificationData) {
          throw new Error("No verification data found")
        }

        const isValid = await emailService.verifyOTP(this.verificationData.email, otp)
        if (!isValid) {
          throw new Error("Invalid verification code")
        }

        // Update existing user document status to active
        const userId = this.generateUserId(this.verificationData.uid)
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
        this.error = error.message
        console.error("Login error:", error)
        return { success: false }
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
            photoURL: user.photoURL || "",
            email: user.email || additionalUserInfo?.profile?.email || "",
            role: "user",
            status: "active", // Always set as active for Google sign-in
            emailVerified: true,
          })
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
        if (!this.verificationData && !email) {
          throw new Error("No verification data found")
        }

        const verificationEmail = email || this.verificationData.email
        const firstName = this.verificationData?.firstName || ""

        await emailService.sendOTP(verificationEmail, firstName)
        return true
      } catch (error) {
        console.error("Error resending verification email:", error)
        this.error = error.message
        return false
      }
    },

    async sendPasswordResetEmail(email) {
      this.loading = true
      this.error = null
      try {
        await sendPasswordResetEmail(auth, email)
        return true
      } catch (error) {
        this.error = error.message
        console.error("Password reset email error:", error)
        return false
      } finally {
        this.loading = false
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
  },
})

