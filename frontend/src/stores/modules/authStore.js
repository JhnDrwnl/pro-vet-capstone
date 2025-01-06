// src/stores/modules/authStore.js
import { defineStore } from 'pinia';
import { auth, db } from '@shared/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    isInitialized: false,
    registrationMethod: null,
    verificationEmail: null,
    rememberMe: false
  }),
  
  actions: {
    generateUserId(uid) {
      return `user_${uid.substring(0, 8)}`;
    },

    async initializeAuth() {
      return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            await this.fetchUserData(user);
          } else {
            this.user = null;
          }
          this.isInitialized = true;
          unsubscribe();
          resolve();
        }, (error) => {
          this.error = error.message;
          this.isInitialized = true;
          reject(error);
        });
      });
    },

    async fetchUserData(user) {
      const userId = this.generateUserId(user.uid);
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        this.user = {
          ...user,
          userId: userId,
          role: userDoc.data().role
        };
      } else {
        console.error('User document not found');
        this.user = null;
      }
    },

    async createUserDocument(user, additionalData = {}) {
      if (!user) return;

      const userId = this.generateUserId(user.uid);
      const userRef = doc(db, 'users', userId);
      const userData = {
        email: user.email,
        uid: user.uid,
        createdAt: new Date(),
        role: additionalData.role || 'user',
        ...additionalData
      };

      try {
        await setDoc(userRef, userData);
        console.log('User document created successfully with ID:', userId);
        console.log('Stored user data:', userData);
        return userId;
      } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
      }
    },

    async registerUser({ email, password, firstName, lastName, role = 'user' }) {
      this.loading = true;
      this.error = null;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userId = await this.createUserDocument(user, { firstName, lastName, role });
        this.registrationMethod = 'email';
        console.log('User registered and document created with ID:', userId);
        
        await sendEmailVerification(user);
        this.verificationEmail = email;
        
        await this.logoutUser();
        
        return email;
      } catch (error) {
        this.error = error.message;
        console.error('Registration error:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loginUser({ email, password, rememberMe }) {
      this.loading = true;
      this.error = null;
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (!user.emailVerified) {
          await signOut(auth);
          this.error = "Please verify your email before logging in.";
          this.user = null;
          return { success: false, emailVerificationRequired: true };
        }
        
        await this.fetchUserData(user);
        
        this.rememberMe = rememberMe;
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userEmail', email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('userEmail');
        }
        
        return { success: true };
      } catch (error) {
        this.error = error.message;
        console.error('Login error:', error);
        return { success: false };
      } finally {
        this.loading = false;
      }
    },

    async logoutUser() {
      this.loading = true;
      this.error = null;
      try {
        await signOut(auth);
        this.user = null;
        this.registrationMethod = null;
        this.rememberMe = false;
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userEmail');
      } catch (error) {
        this.error = error.message;
        console.error('Logout error:', error);
      } finally {
        this.loading = false;
      }
    },

    async signInWithGoogle() {
      this.loading = true;
      this.error = null;
      try {
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        console.log('Google sign-in user:', user);
        console.log('User email:', user.email);
        console.log('User display name:', user.displayName);
        console.log('User photo URL:', user.photoURL);
        console.log('User UID:', user.uid);

        const additionalUserInfo = getAdditionalUserInfo(result);
        console.log('Is new user:', additionalUserInfo?.isNewUser);

        const userId = this.generateUserId(user.uid);
        const userDoc = await getDoc(doc(db, 'users', userId));

        if (!userDoc.exists() || additionalUserInfo?.isNewUser) {
          const nameParts = user.displayName ? user.displayName.split(' ') : ['', ''];
          let firstName, lastName;

          if (nameParts.length >= 2) {
            lastName = nameParts.pop();
            firstName = nameParts.join(' ');
          } else {
            firstName = nameParts[0] || '';
            lastName = '';
          }

          console.log('Parsed firstName:', firstName);
          console.log('Parsed lastName:', lastName);

          await this.createUserDocument(user, {
            firstName,
            lastName,
            photoURL: user.photoURL || '',
            email: user.email || additionalUserInfo?.profile?.email || '',
            role: 'user'
          });
        }

        await this.fetchUserData(user);
        this.registrationMethod = 'google';
        console.log('Google sign-in successful');
      } catch (error) {
        this.error = error.message;
        console.error('Google sign-in error:', error);
      } finally {
        this.loading = false;
      }
    },

    async verifyEmail(oobCode) {
      this.loading = true;
      this.error = null;
      try {
        await auth.applyActionCode(oobCode);
        const user = auth.currentUser;
        if (user) {
          const userId = this.generateUserId(user.uid);
          await setDoc(doc(db, 'users', userId), { emailVerified: true }, { merge: true });
        }
        return true;
      } catch (error) {
        this.error = error.message;
        console.error('Email verification error:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    async resendVerificationEmail(email) {
      try {
        const user = auth.currentUser;
        if (user && user.email === email) {
          await sendEmailVerification(user);
          return true;
        } else {
          const userCredential = await signInWithEmailAndPassword(auth, email, 'dummy-password');
          await sendEmailVerification(userCredential.user);
          await signOut(auth);
          return true;
        }
      } catch (error) {
        console.error('Error resending verification email:', error);
        this.error = error.message;
        return false;
      }
    },

    async sendPasswordResetEmail(email) {
      this.loading = true;
      this.error = null;
      try {
        await sendPasswordResetEmail(auth, email);
        return true;
      } catch (error) {
        this.error = error.message;
        console.error('Password reset email error:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    checkRememberMe() {
      const rememberMe = localStorage.getItem('rememberMe');
      if (rememberMe === 'true') {
        this.rememberMe = true;
        return localStorage.getItem('userEmail') || '';
      }
      return '';
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role || null
  }
});
