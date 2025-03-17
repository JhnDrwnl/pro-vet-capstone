// stores/modules/archivesStore.js
import { defineStore } from 'pinia';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@shared/firebase';
import { useServiceCategoryStore } from './ServiceCategoryStore';

export const useArchivesStore = defineStore('archives', {
  state: () => ({
    archivedItems: [],
    loading: false,
    error: null,
    selectedArchivedItem: null
  }),

  actions: {
    /**
     * Save an item to the archives collection
     * @param {Object} itemData - The item data to archive
     * @returns {string|null} - The ID of the archived item or null if failed
     */
    async saveToArchivesCollection(itemData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Generate a meaningful document ID
        const timestamp = new Date().getTime();
        const itemType = itemData.itemType || 'unknown';
        const itemName = itemData.name ? itemData.name.toLowerCase().replace(/\s+/g, '-').substring(0, 20) : 'unnamed';
        const originalId = itemData.originalId || 'no-id';
        
        // Create a document ID that includes type, name, original ID, and timestamp
        const docId = `${itemType}-${itemName}-${originalId}-${timestamp}`;
        
        console.log('Generated archive ID:', docId);
        
        // Create a reference to the document
        const archiveRef = doc(db, 'archives', docId);
        
        // Add timestamps to the item data
        const itemWithMetadata = {
          ...itemData,
          id: docId,
          archivedAt: serverTimestamp()
        };
        
        // Save to Firestore
        await setDoc(archiveRef, itemWithMetadata);
        
        console.log('Item archived successfully:', docId);
        
        // Update local state
        this.archivedItems.push({
          id: docId,
          ...itemWithMetadata
        });
        
        return docId;
      } catch (error) {
        console.error('Error archiving item:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Fetch all archived items
     * @returns {Array} - Array of archived item objects
     */
    async fetchArchivedItems() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Fetching archived items');
        // Query archives collection
        const archivesRef = collection(db, 'archives');
        const q = query(archivesRef, orderBy('archivedAt', 'desc'));
        const archivesSnapshot = await getDocs(q);
        
        if (!archivesSnapshot.empty) {
          const archivesData = archivesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log('Fetched archived items data:', archivesData);
          this.archivedItems = archivesData;
          return archivesData;
        } else {
          console.log('No archived items found');
          this.archivedItems = [];
          return [];
        }
      } catch (error) {
        console.error('Error fetching archived items:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Restore an archived item to its original collection
     * @param {string} archiveId - The ID of the archived item to restore
     * @returns {boolean} - Success status
     */
    async restoreArchivedItem(archiveId) {
      this.loading = true;
      this.error = null;
      
      // Get the ServiceCategoryStore to use its methods for restoration
      const serviceCategoryStore = useServiceCategoryStore();
      
      try {
        console.log('Attempting to restore archived item with ID:', archiveId);
        
        // First, check if we have the item in our local state
        let archiveData = this.archivedItems.find(item => item.id === archiveId);
        
        // If not in local state, try to fetch from Firestore
        if (!archiveData) {
          console.log('Item not found in local state, fetching from Firestore...');
          const archiveRef = doc(db, 'archives', archiveId);
          const archiveDoc = await getDoc(archiveRef);
          
          if (!archiveDoc.exists()) {
            console.error('Document does not exist in Firestore:', archiveId);
            throw new Error(`Archived item not found in Firestore: ${archiveId}`);
          }
          
          archiveData = {
            ...archiveDoc.data(),
            id: archiveDoc.id
          };
          console.log('Retrieved item from Firestore:', archiveData);
        } else {
          console.log('Found item in local state:', archiveData);
        }
        
        // Make sure we have the required fields
        if (!archiveData.itemType || !archiveData.originalId) {
          throw new Error('Missing required fields: itemType or originalId');
        }
        
        // Determine the original collection based on itemType
        if (archiveData.itemType === 'service') {
          console.log('Restoring service to services collection');
          
          // Prepare service data for restoration
          const serviceData = { ...archiveData };
          
          // Remove archive-specific fields
          delete serviceData.id;
          delete serviceData.archivedAt;
          delete serviceData.itemType;
          delete serviceData.originalId;
          
          // Use the original ID
          const originalId = archiveData.originalId;
          
          // Create a reference to the original document
          const serviceRef = doc(db, 'services', originalId);
          
          // Save to services collection
          await setDoc(serviceRef, {
            ...serviceData,
            id: originalId,
            updatedAt: serverTimestamp(),
            restoredAt: serverTimestamp(),
            archived: false
          });
          
          console.log('Service restored successfully:', originalId);
          
        } else if (archiveData.itemType === 'category') {
          console.log('Restoring category to categories collection');
          
          // Prepare category data for restoration
          const categoryData = { ...archiveData };
          
          // Remove archive-specific fields
          delete categoryData.id;
          delete categoryData.archivedAt;
          delete categoryData.itemType;
          delete categoryData.originalId;
          
          // Use the original ID
          const originalId = archiveData.originalId;
          
          // Create a reference to the original document
          const categoryRef = doc(db, 'categories', originalId);
          
          // Save to categories collection
          await setDoc(categoryRef, {
            ...categoryData,
            id: originalId,
            updatedAt: serverTimestamp(),
            restoredAt: serverTimestamp(),
            archived: false
          });
          
          console.log('Category restored successfully:', originalId);
          
        } else {
          throw new Error('Unknown item type: ' + archiveData.itemType);
        }
        
        // Delete from archives collection
        console.log('Deleting item from archives collection:', archiveId);
        const archiveRef = doc(db, 'archives', archiveId);
        await deleteDoc(archiveRef);
        console.log('Item deleted from archives collection:', archiveId);
        
        // Update local state
        this.archivedItems = this.archivedItems.filter(item => item.id !== archiveId);
        
        // Refresh the ServiceCategoryStore data
        if (archiveData.itemType === 'service') {
          await serviceCategoryStore.fetchServices();
        } else if (archiveData.itemType === 'category') {
          await serviceCategoryStore.fetchCategories();
        }
        
        // Refresh archived items to ensure UI is updated
        await this.fetchArchivedItems();
        
        return true;
      } catch (error) {
        console.error('Error restoring archived item:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Permanently delete an archived item
     * @param {string} archiveId - The ID of the archived item to delete
     * @returns {boolean} - Success status
     */
    async permanentlyDeleteArchivedItem(archiveId) {
      this.loading = true;
      this.error = null;
      
      try {
        // Delete from archives collection
        const archiveRef = doc(db, 'archives', archiveId);
        await deleteDoc(archiveRef);
        
        console.log('Archived item permanently deleted:', archiveId);
        
        // Update local state
        this.archivedItems = this.archivedItems.filter(item => item.id !== archiveId);
        
        return true;
      } catch (error) {
        console.error('Error permanently deleting archived item:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Get a specific archived item by ID
     * @param {string} archiveId - The ID of the archived item to get
     * @returns {Object|null} - The archived item object or null if not found
     */
    async getArchivedItemById(archiveId) {
      this.loading = true;
      this.error = null;
      
      try {
        // First check if we have it in our local state
        let archivedItem = this.archivedItems.find(item => item.id === archiveId);
        
        if (archivedItem) {
          this.selectedArchivedItem = archivedItem;
          return archivedItem;
        }
        
        // If not in local state, fetch from Firestore
        const archiveRef = doc(db, 'archives', archiveId);
        const archiveDoc = await getDoc(archiveRef);
        
        if (archiveDoc.exists()) {
          archivedItem = {
            id: archiveDoc.id,
            ...archiveDoc.data()
          };
          
          this.selectedArchivedItem = archivedItem;
          return archivedItem;
        } else {
          console.error('Archived item not found:', archiveId);
          this.error = 'Archived item not found';
          return null;
        }
      } catch (error) {
        console.error('Error getting archived item:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    }
  },

  getters: {
    getArchivedItems: (state) => state.archivedItems,
    getArchivedItemCount: (state) => state.archivedItems.length,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getSelectedArchivedItem: (state) => state.selectedArchivedItem
  }
});