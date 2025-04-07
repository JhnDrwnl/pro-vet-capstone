// src/stores/modules/profileStore.js
import { defineStore } from 'pinia';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@shared/firebase';
import { useAuthStore } from './authStore';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    loading: false,
    error: null,
    completionPercentage: 0
  }),

  actions: {
    // Helper method to check if a URL is a Google photo URL
    isGooglePhotoURL(url) {
      return url && url.startsWith('https://lh3.googleusercontent.com');
    },
    
    // Helper method to check if a URL is a Firebase Storage URL
    isFirebaseStorageURL(url) {
      return url && url.startsWith('https://firebasestorage.googleapis.com');
    },
    
    // Method to create a proxy URL for Google photos
    getProxyPhotoURL(originalURL) {
      if (!originalURL || !this.isGooglePhotoURL(originalURL)) {
        return originalURL;
      }
      
      // Use the API endpoint to proxy the Google photo instead of accessing it directly
      // This will serve the photo through your own backend to avoid CORS/access issues
      console.log('Creating proxy URL for Google photo');
      return `/api/profile/photo-proxy?url=${encodeURIComponent(originalURL)}`;
    },
    
    // Method to refresh the profile photo from the server
    async refreshProfilePhoto(userId) {
      try {
        if (!userId) {
          console.log('No user ID to refresh profile photo');
          return false;
        }
        
        // If the user already has a custom photo, don't refresh
        if (this.profile && this.profile.photoURL && this.isFirebaseStorageURL(this.profile.photoURL)) {
          console.log('User already has a custom photo, skipping refresh:', this.profile.photoURL);
          return false;
        }
        
        // Get the auth store to access the full UID
        const authStore = useAuthStore();
        
        // Use the full UID from auth store if available, otherwise extract from userId
        let uid;
        if (authStore.user && authStore.user.uid) {
          uid = authStore.user.uid;
        } else {
          // Extract the raw UID from the userId (remove 'user_' prefix)
          uid = userId.startsWith('user_') ? userId.substring(5) : userId;
        }
        
        console.log('Refreshing profile photo for user:', uid);
        
        const response = await fetch(`/api/profile/photo/${uid}`);
        const data = await response.json();
        
        if (data.success && data.photoURL && this.profile) {
          console.log('Refreshed profile photo:', data.photoURL);
          
          // If the photo is from Firebase Storage, use it directly
          if (this.isFirebaseStorageURL(data.photoURL)) {
            console.log('Using Firebase Storage photo directly:', data.photoURL);
            this.profile = {
              ...this.profile,
              photoURL: data.photoURL,
              originalPhotoURL: data.photoURL
            };
            return true;
          }
          
          // Create a proxied version of the Google photo URL
          const photoURL = this.getProxyPhotoURL(data.photoURL);
          
          // Update the profile with the new photo URL
          this.profile = {
            ...this.profile,
            photoURL: photoURL,
            originalPhotoURL: data.photoURL // Store the original for reference
          };
          
          return true;
        } else {
          console.log('Failed to refresh profile photo or no photo available');
          return false;
        }
      } catch (error) {
        console.error('Error refreshing profile photo:', error);
        return false;
      }
    },
    
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
          
          // Handle photos based on their source
          if (userData.photoURL) {
            // If it's a Firebase Storage URL, use it directly
            if (this.isFirebaseStorageURL(userData.photoURL)) {
              console.log('Using Firebase Storage photo directly:', userData.photoURL);
              userData.originalPhotoURL = userData.photoURL;
            }
            // If it's a Google photo, create a proxy URL
            else if (this.isGooglePhotoURL(userData.photoURL)) {
              console.log('Using stored Google photo URL:', userData.photoURL);
              userData.originalPhotoURL = userData.photoURL;
              userData.photoURL = this.getProxyPhotoURL(userData.photoURL);
            }
          }
          
          this.profile = userData;
          this.calculateCompletionPercentage(userData);
          
          // Only refresh Google photos, not custom photos
          if (userData.originalPhotoURL && this.isGooglePhotoURL(userData.originalPhotoURL) && 
              !this.isFirebaseStorageURL(userData.photoURL)) {
            await this.refreshProfilePhoto(userId);
          }
          
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
        if (profileData.photoURL) {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // If user already has a custom photo (Firebase Storage) and we're trying to set a Google photo,
            // keep the custom photo and ignore the Google photo
            if (userData.photoURL && this.isFirebaseStorageURL(userData.photoURL) && 
                this.isGooglePhotoURL(profileData.photoURL)) {
              console.log('User has a custom photo, ignoring Google photo update');
              console.log('Current custom photo:', userData.photoURL);
              console.log('Ignored Google photo:', profileData.photoURL);
              
              // Remove the photoURL from profileData to prevent overwriting the custom photo
              delete profileData.photoURL;
            }
            // If this is a Google photo, store the original but process it for display
            else if (this.isGooglePhotoURL(profileData.photoURL)) {
              profileData.originalPhotoURL = profileData.photoURL;
              // Don't modify the original in Firestore
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
        
        // Update local profile state - use proxy URL for Google photos
        const updatedProfile = {
          ...this.profile,
          ...profileData
        };
        
        // If this is a Google photo, use the proxy URL for local state
        if (profileData.photoURL && this.isGooglePhotoURL(profileData.photoURL)) {
          updatedProfile.photoURL = this.getProxyPhotoURL(profileData.photoURL);
          updatedProfile.originalPhotoURL = profileData.photoURL;
        }
        
        this.profile = updatedProfile;
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