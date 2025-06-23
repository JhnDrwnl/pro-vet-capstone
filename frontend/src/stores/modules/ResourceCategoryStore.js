// stores/modules/ResourceCategoryStore.js
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
  orderBy,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@shared/firebase';
import { useArchivesStore } from './archivesStore';

export const useResourceCategoryStore = defineStore('resourceCategory', {
  state: () => ({
    resourceCategories: [], // Primary state variable
    resources: [],
    loading: false,
    error: null,
    selectedCategory: null,
    selectedResource: null,
    archivesStore: useArchivesStore() // Initialize archivesStore here
  }),

  actions: {
    /**
     * Fetch all resource categories
     * @param {Object} options - Optional parameters for filtering and sorting
     * @returns {Array} - Array of category objects
     */
    async fetchResourceCategories(options = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Fetching resource categories');
        // Query resourceCategories collection
        const categoriesRef = collection(db, 'resourceCategories');
        
        // Build query with optional filters and sorting
        let queryRef = categoriesRef;
        
        if (options.orderByField) {
          queryRef = query(queryRef, orderBy(options.orderByField, options.orderDirection || 'asc'));
        } else {
          queryRef = query(queryRef, orderBy('name'));
        }
        
        if (options.filterField && options.filterValue) {
          queryRef = query(queryRef, where(options.filterField, '==', options.filterValue));
        }
        
        if (options.limit) {
          queryRef = query(queryRef, limit(options.limit));
        }
        
        const categoriesSnapshot = await getDocs(queryRef);
        
        if (!categoriesSnapshot.empty) {
          const categoriesData = categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to ISO strings for easier handling
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
          }));
          
          console.log('Fetched resource categories data:', categoriesData);
          this.resourceCategories = categoriesData;
          return categoriesData;
        } else {
          console.log('No resource categories found');
          this.resourceCategories = [];
          return [];
        }
      } catch (error) {
        console.error('Error fetching resource categories:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    // For backward compatibility
    async fetchCategories(options = {}) {
      return this.fetchResourceCategories(options);
    },
    
    /**
     * Add a new category
     * @param {Object} categoryData - The category data to add
     * @returns {Object|null} - The added category object or null if failed
     */
    async createCategory(categoryData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Generate a document ID using the full first word of the name + random 4-digit number
        const words = categoryData.name.toLowerCase().split(/\s+/);
        let namePrefix = words[0]; // Get the first word (full word)
        
        // If the first word is too short, pad it
        if (namePrefix.length < 3) {
          namePrefix = namePrefix.padEnd(3, 'x');
        }
        
        const randomId = Math.floor(1000 + Math.random() * 9000); // Always 4 digits
        const docId = `${namePrefix}${randomId}`;
        
        console.log('Generated category ID:', docId);
        
        // Create a reference to the document with the dynamic ID
        const categoryRef = doc(db, 'resourceCategories', docId);
        
        // Extract file from form data if it exists
        const file = categoryData.file;
        let coverPhotoURL = null;
        
        // Add timestamps and ID to the category data
        const categoryWithMetadata = {
          name: categoryData.name,
          description: categoryData.description,
          id: docId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          archived: false
        };
        
        // Save to Firestore
        await setDoc(categoryRef, categoryWithMetadata);
        
        // Handle cover photo upload if provided
        if (file) {
          coverPhotoURL = await this.uploadCategoryPhoto(docId, file);
          if (coverPhotoURL) {
            await updateDoc(categoryRef, { coverPhoto: coverPhotoURL });
            categoryWithMetadata.coverPhoto = coverPhotoURL;
          }
        }
        
        console.log('Category added successfully:', categoryWithMetadata);
        
        // Update local state
        const newCategory = {
          id: docId,
          ...categoryWithMetadata,
          // Convert Firestore timestamps to dates for the UI
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        this.resourceCategories.push(newCategory);
        return newCategory;
      } catch (error) {
        console.error('Error adding category:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update an existing category
     * @param {string} categoryId - The ID of the category to update
     * @param {Object} categoryData - The updated category data
     * @returns {boolean} - Success status
     */
    async updateCategory(categoryId, categoryData) {
      this.loading = true;
      this.error = null;
      
      try {
        const categoryRef = doc(db, 'resourceCategories', categoryId);
        
        // Check if category exists
        const categoryDoc = await getDoc(categoryRef);
        if (!categoryDoc.exists()) {
          throw new Error('Category not found');
        }
        
        // Extract file from form data if it exists
        const file = categoryData.file;
        let updatedData = {
          name: categoryData.name,
          description: categoryData.description,
          updatedAt: serverTimestamp()
        };
        
        // Handle cover photo upload if provided
        if (file) {
          // Delete existing photo if there is one
          const existingData = categoryDoc.data();
          if (existingData.coverPhoto) {
            await this.deleteCategoryPhoto(existingData.coverPhoto);
          }
          
          // Upload new photo
          const coverPhotoURL = await this.uploadCategoryPhoto(categoryId, file);
          if (coverPhotoURL) {
            updatedData.coverPhoto = coverPhotoURL;
          }
        } else if (categoryData.coverPhoto === null) {
          // If coverPhoto is explicitly set to null, remove the existing photo
          const existingData = categoryDoc.data();
          if (existingData.coverPhoto) {
            await this.deleteCategoryPhoto(existingData.coverPhoto);
            updatedData.coverPhoto = null;
          }
        }
        
        // Update in Firestore
        await updateDoc(categoryRef, updatedData);
        
        // Update local state
        const categoryIndex = this.resourceCategories.findIndex(c => c.id === categoryId);
        if (categoryIndex !== -1) {
          this.resourceCategories[categoryIndex] = {
            ...this.resourceCategories[categoryIndex],
            ...updatedData,
            updatedAt: new Date() // Use current date for UI until sync
          };
        }
        
        console.log('Category updated successfully:', categoryId);
        return true;
      } catch (error) {
        console.error('Error updating category:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Archive a category
     * @param {string} categoryId - The ID of the category to archive
     * @returns {boolean} - Success status
     */
    async archiveCategory(categoryId) {
      this.loading = true;
      this.error = null;
      
      try {
        const categoryRef = doc(db, 'resourceCategories', categoryId);
        
        // Check if category exists
        const categoryDoc = await getDoc(categoryRef);
        if (!categoryDoc.exists()) {
          throw new Error('Category not found');
        }
        
        const categoryData = categoryDoc.data();
        
        // Add to archives collection with explicit itemType and originalId
        await this.archivesStore.saveToArchivesCollection({
          ...categoryData,
          originalId: categoryId,
          itemType: 'category',
          archivedAt: new Date()
        });
        
        // Delete from categories collection
        await deleteDoc(categoryRef);
        
        // Update local state
        this.resourceCategories = this.resourceCategories.filter(c => c.id !== categoryId);
        
        console.log('Category archived successfully:', categoryId);
        return true;
      } catch (error) {
        console.error('Error archiving category:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Delete a category
     * @param {string} categoryId - The ID of the category to delete
     * @returns {boolean} - Success status
     */
    async deleteCategory(categoryId) {
      this.loading = true;
      this.error = null;
      
      try {
        const categoryRef = doc(db, 'resourceCategories', categoryId);
        
        // Check if category exists
        const categoryDoc = await getDoc(categoryRef);
        if (!categoryDoc.exists()) {
          throw new Error('Category not found');
        }
        
        // Check if there are resources using this category
        const resourcesRef = collection(db, 'resources');
        const q = query(resourcesRef, where('categoryId', '==', categoryId));
        const resourcesSnapshot = await getDocs(q);
        
        if (!resourcesSnapshot.empty) {
          throw new Error('Cannot delete category with associated resources. Please remove or reassign resources first.');
        }
        
        // Delete category photo from storage if it exists
        const categoryData = categoryDoc.data();
        if (categoryData.coverPhoto) {
          await this.deleteCategoryPhoto(categoryData.coverPhoto);
        }
        
        // Delete from Firestore
        await deleteDoc(categoryRef);
        
        // Update local state
        this.resourceCategories = this.resourceCategories.filter(c => c.id !== categoryId);
        
        console.log('Category deleted successfully:', categoryId);
        return true;
      } catch (error) {
        console.error('Error deleting category:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Upload a category cover photo to Firebase Storage
     * @param {string} categoryId - The ID of the category
     * @param {File} file - The file to upload
     * @returns {string|null} - The download URL of the uploaded photo or null if failed
     */
    async uploadCategoryPhoto(categoryId, file) {
      try {
        // Create a reference to the storage location
        const photoRef = storageRef(storage, `resourceCategories/${categoryId}/${Date.now()}-${file.name}`);
        
        // Upload the file
        console.log('Uploading category cover photo to Firebase Storage...');
        const snapshot = await uploadBytes(photoRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('Category cover photo uploaded successfully. Download URL:', downloadURL);
        
        return downloadURL;
      } catch (error) {
        console.error('Error uploading category cover photo:', error);
        return null;
      }
    },
    
    /**
     * Delete a category cover photo from Firebase Storage
     * @param {string} photoURL - The URL of the photo to delete
     * @returns {boolean} - Success status
     */
    async deleteCategoryPhoto(photoURL) {
      try {
        if (!photoURL || !photoURL.startsWith('https://firebasestorage.googleapis.com')) {
          return false;
        }
        
        // Extract the path from the URL
        const url = new URL(photoURL);
        const path = decodeURIComponent(url.pathname.split('/o/')[1]);
        const photoRef = storageRef(storage, path);
        
        // Delete the file
        await deleteObject(photoRef);
        console.log('Category cover photo deleted from storage');
        return true;
      } catch (error) {
        console.error('Error deleting category cover photo:', error);
        return false;
      }
    },
    
    /**
     * Get a specific category by ID
     * @param {string} categoryId - The ID of the category to get
     * @returns {Object|null} - The category object or null if not found
     */
    async getCategoryById(categoryId) {
      this.loading = true;
      this.error = null;
      
      try {
        const categoryRef = doc(db, 'resourceCategories', categoryId);
        const categoryDoc = await getDoc(categoryRef);
        
        if (categoryDoc.exists()) {
          const categoryData = {
            id: categoryDoc.id,
            ...categoryDoc.data(),
            // Convert Firestore timestamps to dates
            createdAt: categoryDoc.data().createdAt?.toDate?.() || categoryDoc.data().createdAt,
            updatedAt: categoryDoc.data().updatedAt?.toDate?.() || categoryDoc.data().updatedAt
          };
          
          this.selectedCategory = categoryData;
          return categoryData;
        } else {
          console.error('Category not found:', categoryId);
          this.error = 'Category not found';
          return null;
        }
      } catch (error) {
        console.error('Error getting category:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Fetch all resources
     * @param {Object} options - Optional parameters for filtering and sorting
     * @returns {Array} - Array of resource objects
     */
    async fetchResources(options = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Fetching resources');
        // Query resources collection
        const resourcesRef = collection(db, 'resources');
        
        // Build query with optional filters and sorting
        let queryRef = resourcesRef;
        
        if (options.orderByField) {
          queryRef = query(queryRef, orderBy(options.orderByField, options.orderDirection || 'asc'));
        } else {
          queryRef = query(queryRef, orderBy('name'));
        }
        
        if (options.filterField && options.filterValue) {
          queryRef = query(queryRef, where(options.filterField, '==', options.filterValue));
        }
        
        if (options.categoryId) {
          queryRef = query(queryRef, where('categoryId', '==', options.categoryId));
        }
        
        if (options.status) {
          queryRef = query(queryRef, where('status', '==', options.status));
        }
        
        if (options.type) {
          queryRef = query(queryRef, where('type', '==', options.type));
        }
        
        if (options.limit) {
          queryRef = query(queryRef, limit(options.limit));
        }
        
        const resourcesSnapshot = await getDocs(queryRef);
        
        if (!resourcesSnapshot.empty) {
          const resourcesData = resourcesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to dates
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
          }));
          
          console.log('Fetched resources data:', resourcesData);
          this.resources = resourcesData;
          return resourcesData;
        } else {
          console.log('No resources found');
          this.resources = [];
          return [];
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    // Rest of the methods remain the same...
    
    /**
     * Get category name by ID
     * @param {string} categoryId - The ID of the category
     * @returns {string} - The name of the category
     */
    getCategoryName(categoryId) {
      const category = this.resourceCategories.find(c => c.id === categoryId);
      return category ? category.name : 'Unknown';
    },
    
    /**
     * Get resource count for a category
     * @param {string} categoryId - The ID of the category
     * @returns {number} - The count of resources in the category
     */
    getResourceCountForCategory(categoryId) {
      return this.resources.filter(r => r.categoryId === categoryId).length;
    }
  },

  getters: {
    getResourceCategories: (state) => state.resourceCategories,
    getActiveResourceCategories: (state) => state.resourceCategories.filter(category => !category.archived),
    getResourceCategoryCount: (state) => state.resourceCategories.length,
    getSelectedCategory: (state) => state.selectedCategory,
    
    // For backward compatibility
    getCategories: (state) => state.resourceCategories,
    getActiveCategories: (state) => state.resourceCategories.filter(category => !category.archived),
    getCategoryCount: (state) => state.resourceCategories.length,
    
    getResources: (state) => state.resources,
    getActiveResources: (state) => state.resources.filter(resource => !resource.archived),
    getResourceCount: (state) => state.resources.length,
    getSelectedResource: (state) => state.selectedResource,
    
    getResourcesByType: (state) => (type) => {
      return state.resources.filter(resource => resource.type === type);
    },
    
    getResourcesByStatus: (state) => (status) => {
      return state.resources.filter(resource => resource.status === status);
    },
    
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  }
});