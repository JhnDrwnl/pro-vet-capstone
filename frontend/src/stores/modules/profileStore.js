// src/stores/modules/profileStore.js
import { defineStore } from 'pinia';
import { auth, db, storage } from '@shared/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import {  ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import { useAuthStore } from './authStore';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    loading: false,
    error: null,
    completionPercentage: 0,
  }),

  getters: {
    profileCompletionPercentage: (state) => state.completionPercentage,
  },

  actions: {
    async fetchUserProfile(userId) {
      this.loading = true;
      this.error = null;
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          this.profile = userDoc.data();
          this.calculateCompletionPercentage(this.profile);
          return this.profile;
        } else {
          console.error('User document not found');
          this.profile = null;
          this.completionPercentage = 0;
          return null;
        }
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching user profile:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async uploadProfileImage(userId, imageDataUrl) {
      const fileName = `${Date.now()}_profilePhoto.jpg`;
      const imageRef = storageRef(storage, `users/${userId}/profilePhoto/${fileName}`);
      console.log('Uploading image to:', imageRef.fullPath);
      try {
        await uploadString(imageRef, imageDataUrl, 'data_url');
        const downloadURL = await getDownloadURL(imageRef);
        console.log('Image uploaded successfully. Download URL:', downloadURL);
        return downloadURL;
      } catch (error) {
        console.error('Error uploading profile image:', error);
        throw error;
      }
    },

    async updateUserProfile(userId, profileData) {
      this.loading = true;
      this.error = null;
      try {
        const userRef = doc(db, 'users', userId);

        // Handle profile image upload
        if (profileData.photoURL && profileData.photoURL.startsWith('data:image')) {
          const downloadURL = await this.uploadProfileImage(userId, profileData.photoURL);
          profileData.photoURL = downloadURL;
        }

        // Filter out non-serializable data and undefined values
        const cleanedProfileData = Object.entries(profileData).reduce((acc, [key, value]) => {
          if (value !== undefined && typeof value !== 'function' && !(value instanceof Object)) {
            acc[key] = value;
          }
          return acc;
        }, {});

        await setDoc(userRef, cleanedProfileData, { merge: true });
        this.profile = { ...this.profile, ...cleanedProfileData };
        this.calculateCompletionPercentage(this.profile);
        const authStore = useAuthStore();
        await authStore.fetchUserData(auth.currentUser);
        console.log('User profile updated successfully');
        return true;
      } catch (error) {
        this.error = error.message;
        console.error('Error updating user profile:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    calculateCompletionPercentage(profile) {
      const fields = [
        'firstName',
        'lastName',
        'username',
        'dateOfBirth',
        'age',
        'gender',
        'email',
        'phone',
        'whatsapp',
        'alternativeEmail',
        'streetAddress',
        'city',
        'province',
        'postalCode',
        'country',
        'photoURL'
      ];

      const filledFields = fields.filter(field => profile[field] && String(profile[field]).trim() !== '').length;
      this.completionPercentage = Math.round((filledFields / fields.length) * 100);
    },
  },
});

