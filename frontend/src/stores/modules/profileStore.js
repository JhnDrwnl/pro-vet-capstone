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
          
          // No special handling needed for Google photos - use the stored URL as is
          if (userData.photoURL) {
            console.log('Using stored photo URL:', userData.photoURL);
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
        
        // Get current user data to check if we're updating a Google photo
        let shouldUpdatePhoto = true;
        if (profileData.photoURL) {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // If user already has a Google photo and we're trying to set a new Google photo,
            // make sure we're not downgrading to an older version
            if (userData.photoURL && 
                userData.photoURL.startsWith('https://lh3.googleusercontent.com') && 
                profileData.photoURL.startsWith('https://lh3.googleusercontent.com')) {
              
              // If the URLs are different, log them for debugging
              if (userData.photoURL !== profileData.photoURL) {
                console.log('Comparing Google photo URLs:');
                console.log('Current:', userData.photoURL);
                console.log('New:', profileData.photoURL);
                
                // We'll still update, but log it for tracking
                console.log('Updating Google photo URL in profile store');
              }
            }
          }
        }
        
        // Add updatedAt timestamp
        const dataToUpdate = {
          ...profileData,
          updatedAt: new Date()
        };
        
        // Clean up undefined values - Firestore doesn't accept undefined values
        const cleanData = {};
        for (const [key, value] of Object.entries(dataToUpdate)) {
          // Replace undefined values with null, which Firestore accepts
          cleanData[key] = value === undefined ? null : value;
        }
        
        await setDoc(userRef, cleanData, { merge: true });
        console.log('Profile updated successfully with data:', cleanData);
        
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
    
    // Helper method to check if a URL is a Google photo URL
    isGooglePhotoURL(url) {
      return url && url.startsWith('https://lh3.googleusercontent.com');
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