// stores/modules/ServiceCategoryStore.js
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
  serverTimestamp
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@shared/firebase';
import { useArchivesStore } from './archivesStore';

export const useServiceCategoryStore = defineStore('serviceCategory', {
  state: () => ({
    categories: [],
    services: [],
    loading: false,
    error: null,
    selectedCategory: null,
    selectedService: null,
    archivesStore: useArchivesStore() // Initialize archivesStore here
  }),

  actions: {
    /**
     * Fetch all categories
     * @returns {Array} - Array of category objects
     */
    async fetchCategories() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Fetching categories');
        // Query categories collection
        const categoriesRef = collection(db, 'categories');
        const q = query(categoriesRef, orderBy('name'));
        const categoriesSnapshot = await getDocs(q);
        
        if (!categoriesSnapshot.empty) {
          const categoriesData = categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log('Fetched categories data:', categoriesData);
          this.categories = categoriesData;
          return categoriesData;
        } else {
          console.log('No categories found');
          this.categories = [];
          return [];
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
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
        const categoryRef = doc(db, 'categories', docId);
        
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
          ...categoryWithMetadata
        };
        
        this.categories.push(newCategory);
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
        const categoryRef = doc(db, 'categories', categoryId);
        
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
        const categoryIndex = this.categories.findIndex(c => c.id === categoryId);
        if (categoryIndex !== -1) {
          this.categories[categoryIndex] = {
            ...this.categories[categoryIndex],
            ...updatedData
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
        const categoryRef = doc(db, 'categories', categoryId);
        
        // Check if category exists
        const categoryDoc = await getDoc(categoryRef);
        if (!categoryDoc.exists()) {
          throw new Error('Category not found');
        }
        
        const categoryData = categoryDoc.data();
        
        // Get archives store
        //const archivesStore = useArchivesStore();
        
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
        this.categories = this.categories.filter(c => c.id !== categoryId);
        
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
        const categoryRef = doc(db, 'categories', categoryId);
        
        // Check if category exists
        const categoryDoc = await getDoc(categoryRef);
        if (!categoryDoc.exists()) {
          throw new Error('Category not found');
        }
        
        // Delete category photo from storage if it exists
        const categoryData = categoryDoc.data();
        if (categoryData.coverPhoto) {
          await this.deleteCategoryPhoto(categoryData.coverPhoto);
        }
        
        // Delete from Firestore
        await deleteDoc(categoryRef);
        
        // Update local state
        this.categories = this.categories.filter(c => c.id !== categoryId);
        
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
        const photoRef = storageRef(storage, `categories/${categoryId}/${Date.now()}-${file.name}`);
        
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
        const categoryRef = doc(db, 'categories', categoryId);
        const categoryDoc = await getDoc(categoryRef);
        
        if (categoryDoc.exists()) {
          const categoryData = {
            id: categoryDoc.id,
            ...categoryDoc.data()
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
     * Migrate existing categories with problematic IDs to new format
     * @returns {boolean} - Success status
     */
    async migrateCategories() {
      this.loading = true;
      this.error = null;
      
      try {
        // Fetch all categories
        const categoriesRef = collection(db, 'categories');
        const categoriesSnapshot = await getDocs(categoriesRef);
        
        if (categoriesSnapshot.empty) {
          console.log('No categories to migrate');
          return true;
        }
        
        // Process each category
        const batch = [];
        categoriesSnapshot.forEach(docSnapshot => {
          const categoryId = docSnapshot.id;
          const categoryData = docSnapshot.data();
          
          // Check if ID is too long
          if (categoryId.length > 10) {
            console.log(`Migrating category: ${categoryId}`);
            
            // Generate new ID with consistent length
            const words = categoryData.name.toLowerCase().split(/\s+/);
            let namePrefix = words[0]; // Get the first word (full word)
            
            // If the first word is too short, pad it
            if (namePrefix.length < 3) {
              namePrefix = namePrefix.padEnd(3, 'x');
            }
            
            const randomId = Math.floor(1000 + Math.random() * 9000); // Always 4 digits
            const newId = `${namePrefix}${randomId}`;
            
            // Create new document with new ID
            const newCategoryRef = doc(db, 'categories', newId);
            const newData = {
              ...categoryData,
              id: newId,
              updatedAt: serverTimestamp()
            };
            
            batch.push({
              oldId: categoryId,
              newId: newId,
              data: newData,
              coverPhoto: categoryData.coverPhoto
            });
          }
        });
        
        // Process batch operations
        for (const item of batch) {
          // Create new document
          await setDoc(doc(db, 'categories', item.newId), item.data);
          
          // Delete old document
          await deleteDoc(doc(db, 'categories', item.oldId));
          
          console.log(`Migrated ${item.oldId} to ${item.newId}`);
        }
        
        // Refresh categories
        await this.fetchCategories();
        
        console.log(`Migration completed. Migrated ${batch.length} categories.`);
        return true;
      } catch (error) {
        console.error('Error migrating categories:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch all services
     * @returns {Array} - Array of service objects
     */
    async fetchServices() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Fetching services');
        // Query services collection
        const servicesRef = collection(db, 'services');
        const q = query(servicesRef, orderBy('name'));
        const servicesSnapshot = await getDocs(q);
        
        if (!servicesSnapshot.empty) {
          const servicesData = servicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log('Fetched services data:', servicesData);
          this.services = servicesData;
          return servicesData;
        } else {
          console.log('No services found');
          this.services = [];
          return [];
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Add a new service
     * @param {Object} serviceData - The service data to add
     * @returns {Object|null} - The added service object or null if failed
     */
    async createService(serviceData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Generate a document ID using the full first word of the name + random 4-digit number
        const words = serviceData.name.toLowerCase().split(/\s+/);
        let namePrefix = words[0]; // Get the first word (full word)
        
        // If the first word is too short, pad it
        if (namePrefix.length < 3) {
          namePrefix = namePrefix.padEnd(3, 'x');
        }
        
        const randomId = Math.floor(1000 + Math.random() * 9000); // Always 4 digits
        const docId = `${namePrefix}${randomId}`;
        
        console.log('Generated service ID:', docId);
        
        // Create a reference to the document with the dynamic ID
        const serviceRef = doc(db, 'services', docId);
        
        // Extract file from form data if it exists
        const file = serviceData.file;
        let coverPhotoURL = null;
        
        // Filter out empty requirements
        const requirements = serviceData.requirements.filter(req => req.trim() !== '');
        
        // Add timestamps and ID to the service data
        const serviceWithMetadata = {
          name: serviceData.name,
          categoryId: serviceData.categoryId,
          classification: serviceData.classification,
          transactionType: serviceData.transactionType,
          processingTime: serviceData.processingTime,
          fees: serviceData.fees,
          description: serviceData.description,
          requirements: requirements,
          id: docId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          archived: false
        };
        
        // Save to Firestore
        await setDoc(serviceRef, serviceWithMetadata);
        
        // Handle cover photo upload if provided
        if (file) {
          coverPhotoURL = await this.uploadServicePhoto(docId, file);
          if (coverPhotoURL) {
            await updateDoc(serviceRef, { coverPhoto: coverPhotoURL });
            serviceWithMetadata.coverPhoto = coverPhotoURL;
          }
        }
        
        console.log('Service added successfully:', serviceWithMetadata);
        
        // Update local state
        const newService = {
          id: docId,
          ...serviceWithMetadata
        };
        
        this.services.push(newService);
        return newService;
      } catch (error) {
        console.error('Error adding service:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update an existing service
     * @param {string} serviceId - The ID of the service to update
     * @param {Object} serviceData - The updated service data
     * @returns {boolean} - Success status
     */
    async updateService(serviceId, serviceData) {
      this.loading = true;
      this.error = null;
      
      try {
        const serviceRef = doc(db, 'services', serviceId);
        
        // Check if service exists
        const serviceDoc = await getDoc(serviceRef);
        if (!serviceDoc.exists()) {
          throw new Error('Service not found');
        }
        
        // Extract file from form data if it exists
        const file = serviceData.file;
        
        // Filter out empty requirements
        const requirements = serviceData.requirements.filter(req => req.trim() !== '');
        
        // Prepare update data
        const updatedData = {
          name: serviceData.name,
          categoryId: serviceData.categoryId,
          classification: serviceData.classification,
          transactionType: serviceData.transactionType,
          processingTime: serviceData.processingTime,
          fees: serviceData.fees,
          description: serviceData.description,
          requirements: requirements,
          updatedAt: serverTimestamp()
        };
        
        // Handle cover photo upload if provided
        if (file) {
          // Delete existing photo if there is one
          const existingData = serviceDoc.data();
          if (existingData.coverPhoto) {
            await this.deleteServicePhoto(existingData.coverPhoto);
          }
          
          // Upload new photo
          const coverPhotoURL = await this.uploadServicePhoto(serviceId, file);
          if (coverPhotoURL) {
            updatedData.coverPhoto = coverPhotoURL;
          }
        } else if (serviceData.coverPhoto === null) {
          // If coverPhoto is explicitly set to null, remove the existing photo
          const existingData = serviceDoc.data();
          if (existingData.coverPhoto) {
            await this.deleteServicePhoto(existingData.coverPhoto);
            updatedData.coverPhoto = null;
          }
        }
        
        // Update in Firestore
        await updateDoc(serviceRef, updatedData);
        
        // Update local state
        const serviceIndex = this.services.findIndex(s => s.id === serviceId);
        if (serviceIndex !== -1) {
          this.services[serviceIndex] = {
            ...this.services[serviceIndex],
            ...updatedData
          };
        }
        
        console.log('Service updated successfully:', serviceId);
        return true;
      } catch (error) {
        console.error('Error updating service:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Archive a service
     * @param {string} serviceId - The ID of the service to archive
     * @returns {boolean} - Success status
     */
    async archiveService(serviceId) {
      this.loading = true;
      this.error = null;
      
      try {
        const serviceRef = doc(db, 'services', serviceId);
        
        // Check if service exists
        const serviceDoc = await getDoc(serviceRef);
        if (!serviceDoc.exists()) {
          throw new Error('Service not found');
        }
        
        const serviceData = serviceDoc.data();
        
        // Get archives store
        //const archivesStore = useArchivesStore();
        
        // Add to archives collection with explicit itemType and originalId
        await this.archivesStore.saveToArchivesCollection({
          ...serviceData,
          originalId: serviceId,
          itemType: 'service',
          archivedAt: new Date()
        });
        
        // Delete from services collection
        await deleteDoc(serviceRef);
        
        // Update local state
        this.services = this.services.filter(s => s.id !== serviceId);
        
        console.log('Service archived successfully:', serviceId);
        return true;
      } catch (error) {
        console.error('Error archiving service:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Delete a service
     * @param {string} serviceId - The ID of the service to delete
     * @returns {boolean} - Success status
     */
    async deleteService(serviceId) {
      this.loading = true;
      this.error = null;
      
      try {
        const serviceRef = doc(db, 'services', serviceId);
        
        // Check if service exists
        const serviceDoc = await getDoc(serviceRef);
        if (!serviceDoc.exists()) {
          throw new Error('Service not found');
        }
        
        // Delete service photo from storage if it exists
        const serviceData = serviceDoc.data();
        if (serviceData.coverPhoto) {
          await this.deleteServicePhoto(serviceData.coverPhoto);
        }
        
        // Delete from Firestore
        await deleteDoc(serviceRef);
        
        // Update local state
        this.services = this.services.filter(s => s.id !== serviceId);
        
        console.log('Service deleted successfully:', serviceId);
        return true;
      } catch (error) {
        console.error('Error deleting service:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Upload a service cover photo to Firebase Storage
     * @param {string} serviceId - The ID of the service
     * @param {File} file - The file to upload
     * @returns {string|null} - The download URL of the uploaded photo or null if failed
     */
    async uploadServicePhoto(serviceId, file) {
      try {
        // Create a reference to the storage location
        const photoRef = storageRef(storage, `services/${serviceId}/${Date.now()}-${file.name}`);
        
        // Upload the file
        console.log('Uploading service cover photo to Firebase Storage...');
        const snapshot = await uploadBytes(photoRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('Service cover photo uploaded successfully. Download URL:', downloadURL);
        
        return downloadURL;
      } catch (error) {
        console.error('Error uploading service cover photo:', error);
        return null;
      }
    },
    
    /**
     * Delete a service cover photo from Firebase Storage
     * @param {string} photoURL - The URL of the photo to delete
     * @returns {boolean} - Success status
     */
    async deleteServicePhoto(photoURL) {
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
        console.log('Service cover photo deleted from storage');
        return true;
      } catch (error) {
        console.error('Error deleting service cover photo:', error);
        return false;
      }
    },
    
    /**
     * Get a specific service by ID
     * @param {string} serviceId - The ID of the service to get
     * @returns {Object|null} - The service object or null if not found
     */
    async getServiceById(serviceId) {
      this.loading = true;
      this.error = null;
      
      try {
        const serviceRef = doc(db, 'services', serviceId);
        const serviceDoc = await getDoc(serviceRef);
        
        if (serviceDoc.exists()) {
          const serviceData = {
            id: serviceDoc.id,
            ...serviceDoc.data()
          };
          
          this.selectedService = serviceData;
          return serviceData;
        } else {
          console.error('Service not found:', serviceId);
          this.error = 'Service not found';
          return null;
        }
      } catch (error) {
        console.error('Error getting service:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Get services by category ID
     * @param {string} categoryId - The ID of the category
     * @returns {Array} - Array of service objects
     */
    async getServicesByCategory(categoryId) {
      this.loading = true;
      this.error = null;
      
      try {
        const servicesRef = collection(db, 'services');
        const q = query(servicesRef, where('categoryId', '==', categoryId), where('archived', '==', false));
        const servicesSnapshot = await getDocs(q);
        
        if (!servicesSnapshot.empty) {
          return servicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        } else {
          return [];
        }
      } catch (error) {
        console.error('Error getting services by category:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    }
  },

  getters: {
    getCategories: (state) => state.categories,
    getActiveCategories: (state) => state.categories.filter(category => !category.archived),
    getCategoryCount: (state) => state.categories.length,
    getSelectedCategory: (state) => state.selectedCategory,
    
    getServices: (state) => state.services,
    getActiveServices: (state) => state.services.filter(service => !service.archived),
    getServiceCount: (state) => state.services.length,
    getSelectedService: (state) => state.selectedService,
    
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  }
});