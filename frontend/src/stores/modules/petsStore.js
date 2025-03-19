// stores/modules/petsStore
import { defineStore } from 'pinia';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@shared/firebase';

export const usePetsStore = defineStore('pets', {
  state: () => ({
    pets: [],
    loading: false,
    error: null,
    selectedPet: null
  }),

  actions: {
    /**
     * Generate a dynamic document ID for a pet
     * @param {Object} petData - The pet data
     * @param {string} userId - The ID of the user
     * @returns {string} - The generated document ID
     */
    generatePetDocId(petData, userId) {
      // Create a shorter dynamic document ID
      const petName = (petData.name || 'pet').toLowerCase().replace(/\s+/g, '-');
      const shortId = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      
      return `${petName}-${shortId}`;
    },

    /**
     * Fetch all pets for a specific user
     * @param {string} userId - The ID of the user
     * @returns {Array} - Array of pet objects
     */
    async fetchUserPets(userId) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Fetching pets for userId:', userId);
        // Query pets collection where ownerId matches userId
        const petsRef = collection(db, 'pets');
        const q = query(petsRef, where('ownerId', '==', userId));
        const petsSnapshot = await getDocs(q);
        
        if (!petsSnapshot.empty) {
          const petsData = petsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log('Fetched pets data:', petsData);
          this.pets = petsData;
          return petsData;
        } else {
          console.log('No pets found for user:', userId);
          this.pets = [];
          return [];
        }
      } catch (error) {
        console.error('Error fetching user pets:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Add a new pet
     * @param {string} userId - The ID of the user
     * @param {Object} petData - The pet data to add
     * @returns {Object|null} - The added pet object or null if failed
     */
    async addPet(userId, petData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Generate a dynamic document ID
        const docId = this.generatePetDocId(petData, userId);
        
        // Create a reference to the document with the dynamic ID
        const petRef = doc(db, 'pets', docId);
        
        // Add timestamps, ID, and ownerId to the pet data
        const petWithMetadata = {
          ...petData,
          id: docId,
          ownerId: userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Save to Firestore
        await setDoc(petRef, petWithMetadata);
        
        // Handle pet photo if it's a data URL (from file upload)
        if (petData.photoURL && petData.photoURL.startsWith('data:')) {
          const photoURL = await this.uploadPetPhoto(userId, docId, petData.photoURL);
          if (photoURL) {
            await updateDoc(petRef, { photoURL });
            petWithMetadata.photoURL = photoURL;
          }
        }
        
        console.log('Pet added successfully:', petWithMetadata);
        
        // Update local state
        const newPet = {
          id: docId,
          ...petWithMetadata
        };
        
        this.pets.push(newPet);
        return newPet;
      } catch (error) {
        console.error('Error adding pet:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update an existing pet
     * @param {string} userId - The ID of the user
     * @param {string} petId - The ID of the pet to update
     * @param {Object} petData - The updated pet data
     * @returns {boolean} - Success status
     */
    async updatePet(userId, petId, petData) {
      this.loading = true;
      this.error = null;
      
      try {
        const petRef = doc(db, 'pets', petId);
        
        // Check if pet exists and belongs to user
        const petDoc = await getDoc(petRef);
        if (!petDoc.exists()) {
          throw new Error('Pet not found');
        }
        
        // Verify ownership
        const existingPetData = petDoc.data();
        if (existingPetData.ownerId !== userId) {
          throw new Error('Unauthorized to update this pet');
        }
        
        // Handle pet photo if it's a data URL (from file upload)
        let updatedData = { ...petData };
        
        if (petData.photoURL && petData.photoURL.startsWith('data:')) {
          const photoURL = await this.uploadPetPhoto(userId, petId, petData.photoURL);
          if (photoURL) {
            updatedData.photoURL = photoURL;
          }
        }
        
        // Add updated timestamp
        updatedData.updatedAt = serverTimestamp();
        
        // Update in Firestore
        await updateDoc(petRef, updatedData);
        
        // Update local state
        const petIndex = this.pets.findIndex(p => p.id === petId);
        if (petIndex !== -1) {
          this.pets[petIndex] = {
            ...this.pets[petIndex],
            ...updatedData
          };
        }
        
        console.log('Pet updated successfully:', petId);
        return true;
      } catch (error) {
        console.error('Error updating pet:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Delete a pet
     * @param {string} userId - The ID of the user
     * @param {string} petId - The ID of the pet to delete
     * @returns {boolean} - Success status
     */
    async deletePet(userId, petId) {
      this.loading = true;
      this.error = null;
      
      try {
        const petRef = doc(db, 'pets', petId);
        
        // Check if pet exists and belongs to user
        const petDoc = await getDoc(petRef);
        if (!petDoc.exists()) {
          throw new Error('Pet not found');
        }
        
        // Verify ownership
        const petData = petDoc.data();
        if (petData.ownerId !== userId) {
          throw new Error('Unauthorized to delete this pet');
        }
        
        // Delete pet photo from storage if it exists
        if (petData.photoURL && petData.photoURL.startsWith('https://firebasestorage.googleapis.com')) {
          try {
            // Extract the path from the URL
            const url = new URL(petData.photoURL);
            const path = decodeURIComponent(url.pathname.split('/o/')[1]);
            const photoRef = storageRef(storage, path);
            await deleteObject(photoRef);
            console.log('Pet photo deleted from storage');
          } catch (photoError) {
            console.error('Error deleting pet photo:', photoError);
            // Continue with pet deletion even if photo deletion fails
          }
        }
        
        // Delete from Firestore
        await deleteDoc(petRef);
        
        // Update local state
        this.pets = this.pets.filter(p => p.id !== petId);
        
        console.log('Pet deleted successfully:', petId);
        return true;
      } catch (error) {
        console.error('Error deleting pet:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Upload a pet photo to Firebase Storage
     * @param {string} userId - The ID of the user
     * @param {string} petId - The ID of the pet
     * @param {string} dataUrl - The data URL of the photo
     * @returns {string|null} - The download URL of the uploaded photo or null if failed
     */
    async uploadPetPhoto(userId, petId, dataUrl) {
      try {
        // Convert data URL to Blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        
        // Create a reference to the storage location
        const photoRef = storageRef(storage, `pet-photos/${userId}/${petId}/${Date.now()}`);
        
        // Upload the file
        console.log('Uploading pet photo to Firebase Storage...');
        const snapshot = await uploadBytes(photoRef, blob);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('Pet photo uploaded successfully. Download URL:', downloadURL);
        
        return downloadURL;
      } catch (error) {
        console.error('Error uploading pet photo:', error);
        return null;
      }
    },
    
    /**
     * Get a specific pet by ID
     * @param {string} userId - The ID of the user
     * @param {string} petId - The ID of the pet to get
     * @returns {Object|null} - The pet object or null if not found
     */
    async getPetById(userId, petId) {
      this.loading = true;
      this.error = null;
      
      try {
        const petRef = doc(db, 'pets', petId);
        const petDoc = await getDoc(petRef);
        
        if (petDoc.exists()) {
          const petData = {
            id: petDoc.id,
            ...petDoc.data()
          };
          
          // Verify ownership
          if (petData.ownerId !== userId) {
            throw new Error('Unauthorized to access this pet');
          }
          
          this.selectedPet = petData;
          return petData;
        } else {
          console.error('Pet not found:', petId);
          this.error = 'Pet not found';
          return null;
        }
      } catch (error) {
        console.error('Error getting pet:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Calculate pet's age in years, months, and weeks
     * @param {Object} pet - The pet object with ageYears, ageMonths, and ageWeeks properties
     * @returns {string} - Formatted age string
     */
    calculatePetAge(pet) {
      if (!pet) return '';
      
      const years = pet.ageYears || 0;
      const months = pet.ageMonths || 0;
      const weeks = pet.ageWeeks || 0;
      
      let ageString = '';
      
      if (years > 0) {
        ageString += `${years} ${years === 1 ? 'year' : 'years'}`;
      }
      
      if (months > 0) {
        ageString += ageString ? `, ${months} ${months === 1 ? 'month' : 'months'}` : `${months} ${months === 1 ? 'month' : 'months'}`;
      }
      
      if (weeks > 0) {
        ageString += ageString ? `, ${weeks} ${weeks === 1 ? 'week' : 'weeks'}` : `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
      }
      
      return ageString || 'Unknown';
    }
  },

  getters: {
    getPets: (state) => state.pets,
    getPetCount: (state) => state.pets.length,
    getSelectedPet: (state) => state.selectedPet,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  }
});