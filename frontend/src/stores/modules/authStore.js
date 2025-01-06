// src/stores/modules/authStore.js
import { defineStore } from 'pinia';
import { auth, db } from '@shared/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, query, collection, where } from 'firebase/firestore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),
  
  actions: {
    generateUserId(uid) {
      return `user_${uid.substring(0, 8)}`;
    },

    async createUserDocument(user, additionalData = {}) {
      if (!user) return;

      const userId = this.generateUserId(user.uid);
      const userRef = doc(db, 'users', userId);
      const userData = {
        email: user.email,
        uid: user.uid,
        createdAt: new Date(),
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

    async registerUser({ email, password, firstName, lastName }) {
      this.loading = true;
      this.error = null;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;
        
        const userId = await this.createUserDocument(this.user, { firstName, lastName });
        this.user.userId = userId;
        console.log('User registered and document created with ID:', userId);
      } catch (error) {
        this.error = error.message;
        console.error('Registration error:', error);
      } finally {
        this.loading = false;
      }
    },

    async loginUser({ email, password }) {
      this.loading = true;
      this.error = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;
        const userId = this.generateUserId(this.user.uid);
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          this.user.userId = userId;
        } else {
          console.error('User document not found');
        }
      } catch (error) {
        this.error = error.message;
        console.error('Login error:', error);
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
        this.user = result.user;

        console.log('Google sign-in user:', this.user);
        console.log('User email:', this.user.email);
        console.log('User display name:', this.user.displayName);
        console.log('User photo URL:', this.user.photoURL);
        console.log('User UID:', this.user.uid);

        const additionalUserInfo = getAdditionalUserInfo(result);
        console.log('Is new user:', additionalUserInfo?.isNewUser);

        const userId = this.generateUserId(this.user.uid);
        const userDoc = await getDoc(doc(db, 'users', userId));

        if (!userDoc.exists() || additionalUserInfo?.isNewUser) {
          // If the document doesn't exist or it's a new user, create it
          const nameParts = this.user.displayName ? this.user.displayName.split(' ') : ['', ''];
          let firstName, lastName;

          if (nameParts.length >= 2) {
            lastName = nameParts.pop(); // Get the last part as lastName
            firstName = nameParts.join(' '); // Join the rest as firstName
          } else {
            firstName = nameParts[0] || '';
            lastName = '';
          }

          console.log('Parsed firstName:', firstName);
          console.log('Parsed lastName:', lastName);

          await this.createUserDocument(this.user, {
            firstName,
            lastName,
            photoURL: this.user.photoURL || '',
            email: this.user.email || additionalUserInfo?.profile?.email || ''
          });
        }

        this.user.userId = userId;
        console.log('Google sign-in successful');
      } catch (error) {
        this.error = error.message;
        console.error('Google sign-in error:', error);
      } finally {
        this.loading = false;
      }
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user
  }
});