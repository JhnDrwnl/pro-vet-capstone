// src/stores/modules/profileStore.js
import { defineStore } from 'pinia';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@shared/firebase';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    loading: false,
    error: null,
    completionPercentage: 0
  }),

  actions: {
    async fetchUserProfile(userId) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Fetching profile for userId:', userId);
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User profile data:', userData);
          
          // Fix for Google photoURL - ensure it's properly stored
          if (userData.photoURL && userData.photoURL.startsWith('https://lh3.googleusercontent.com')) {
            // Make sure the URL doesn't have any size restrictions that might be causing issues
            const cleanPhotoURL = userData.photoURL.split('=')[0];
            
            // Update the document with the clean URL if needed
            if (cleanPhotoURL !== userData.photoURL) {
              console.log('Updating photoURL in profile store:', cleanPhotoURL);
              await updateDoc(userRef, { photoURL: cleanPhotoURL });
              userData.photoURL = cleanPhotoURL;
            }
          }
          
          this.profile = userData;
          this.calculateCompletionPercentage(userData);
          return userData;
        } else {
          console.error('No user document found for ID:', userId);
          this.error = 'User profile not found';
          return null;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async updateUserProfile(userId, profileData) {
      this.loading = true;
      this.error = null;
      
      try {
        const userRef = doc(db, 'users', userId);
        
        // Process photoURL if present
        if (profileData.photoURL && profileData.photoURL.startsWith('https://lh3.googleusercontent.com')) {
          profileData.photoURL = profileData.photoURL.split('=')[0];
        }
        
        // Add updatedAt timestamp
        const dataToUpdate = {
          ...profileData,
          updatedAt: new Date()
        };
        
        await setDoc(userRef, dataToUpdate, { merge: true });
        
        // Update local profile state
        this.profile = {
          ...this.profile,
          ...profileData
        };
        
        this.calculateCompletionPercentage(this.profile);
        return true;
      } catch (error) {
        console.error('Error updating user profile:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    calculateCompletionPercentage(profile) {
      if (!profile) {
        this.completionPercentage = 0;
        return;
      }
      
      const requiredFields = [
        'firstName',
        'lastName',
        'email',
        'phone',
        'dateOfBirth',
        'gender',
        'streetAddress',
        'city',
        'province',
        'postalCode',
        'country'
      ];
      
      let filledFields = 0;
      
      requiredFields.forEach(field => {
        if (profile[field] && String(profile[field]).trim() !== '') {
          filledFields++;
        }
      });
      
      this.completionPercentage = Math.round((filledFields / requiredFields.length) * 100);
    }
  },
  
  getters: {
    getProfile: (state) => state.profile,
    getCompletionPercentage: (state) => state.completionPercentage,
    isProfileComplete: (state) => state.completionPercentage === 100
  }
});