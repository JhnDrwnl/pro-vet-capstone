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
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from '@shared/firebase';
import { useServiceCategoryStore } from './ServiceCategoryStore';
import { useAuthStore } from './authStore';
import axios from 'axios';

export const useArchivesStore = defineStore('archives', {
  state: () => ({
    archivedItems: [],
    archivedUsers: [],
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
     * Generate a consistent user ID from Firebase UID
     * @param {string} uid - Firebase UID
     * @returns {string} - Formatted user ID
     */
    generateUserId(uid) {
      return `user_${uid.substring(0, 8)}`;
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
          
        } else if (archiveData.itemType === 'user') {
          console.log('Restoring user with server-side endpoint');
          
          // Get the original Firebase UID
          const originalUid = archiveData.originalId;
          
          try {
            // Call the server endpoint to restore the user
            // Updated to use the plural 'archives' to match server.js
            const restoreResponse = await axios.post('/api/archives/restore-user', {
              uid: originalUid
            });
            
            if (!restoreResponse.data.success) {
              console.error('Failed to restore user:', restoreResponse.data.message);
              throw new Error('Failed to restore user: ' + restoreResponse.data.message);
            }
            
            console.log('User restored successfully:', originalUid);
            
            // Update local state - the server-side restore already deletes from archives
            this.archivedItems = this.archivedItems.filter(item => item.id !== archiveId);
            
          } catch (error) {
            console.error('Error restoring user:', error);
            throw new Error('Error restoring user: ' + error.message);
          }
        } else {
          throw new Error('Unknown item type: ' + archiveData.itemType);
        }
        
        // For non-user items, delete from archives collection
        if (archiveData.itemType !== 'user') {
          console.log('Deleting item from archives collection:', archiveId);
          const archiveRef = doc(db, 'archives', archiveId);
          await deleteDoc(archiveRef);
          console.log('Item deleted from archives collection:', archiveId);
          
          // Update local state
          this.archivedItems = this.archivedItems.filter(item => item.id !== archiveId);
        }
        
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
        // Get the archived item data first to check if it's a user
        const archiveRef = doc(db, 'archives', archiveId);
        const archiveDoc = await getDoc(archiveRef);
        
        if (!archiveDoc.exists()) {
          throw new Error('Archived item not found');
        }
        
        const archiveData = archiveDoc.data();
        
        // If it's a user, we need to use the server endpoint
        if (archiveData.itemType === 'user') {
          try {
            console.log('Attempting to permanently delete user:', archiveData);
            
            // Extract the uid - try different properties based on what's available
            let uid = null;
            
            if (archiveData.uid) {
              // If uid is directly available, use it
              uid = archiveData.uid;
              console.log('Using uid from archiveData.uid:', uid);
            } else if (archiveData.originalId && archiveData.originalId.startsWith('user_')) {
              // If originalId is in the format user_XXXX, extract the XXXX part
              uid = archiveData.originalId.replace('user_', '');
              console.log('Extracted uid from originalId:', uid);
            } else if (archiveData.originalId) {
              // If originalId is available but not in user_ format, use it directly
              uid = archiveData.originalId;
              console.log('Using originalId as uid:', uid);
            } else {
              // Last resort - use the document ID without the user_ prefix if it has one
              uid = archiveId.startsWith('user_') ? archiveId.replace('user_', '') : archiveId;
              console.log('Using document ID as uid:', uid);
            }
            
            if (!uid) {
              throw new Error('Could not determine user ID for deletion');
            }
            
            // For debugging, log the exact request we're about to make
            console.log('Making DELETE request to permanently delete user with uid:', uid);
            console.log('Request URL:', `${process.env.VUE_APP_API_URL || ''}/api/archives/permanently-delete-user`);
            
            // Use the full API URL with the environment variable
            const apiUrl = `${process.env.VUE_APP_API_URL || ''}/api/archives/permanently-delete-user`;
            
            // Make the request with the uid in the request body
            const response = await axios({
              method: 'DELETE',
              url: apiUrl,
              data: { uid }
            });
            
            if (!response.data.success) {
              console.error('Failed to permanently delete user:', response.data.message);
              throw new Error('Failed to permanently delete user: ' + response.data.message);
            }
            
            console.log('User permanently deleted:', uid);
            
            // Update local state
            this.archivedItems = this.archivedItems.filter(item => item.id !== archiveId);
            
            return true;
          } catch (error) {
            console.error('Error permanently deleting user:', error);
            
            // If the server returns a 404, it means the user is already deleted from Firebase Auth
            // In this case, we should still delete the archive document
            if (error.response && error.response.status === 404) {
              console.log('User not found in Firebase Auth, deleting archive document anyway');
              await deleteDoc(archiveRef);
              this.archivedItems = this.archivedItems.filter(item => item.id !== archiveId);
              return true;
            }
            
            throw new Error('Error permanently deleting user: ' + (error.message || 'Unknown error'));
          }
        } else {
          // For non-user items, just delete from archives collection
          await deleteDoc(archiveRef);
          
          console.log('Archived item permanently deleted:', archiveId);
          
          // Update local state
          this.archivedItems = this.archivedItems.filter(item => item.id !== archiveId);
          
          return true;
        }
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
    },

    /**
     * Fetch all archived users
     * @returns {Array} - Array of archived user objects
     */
    async fetchArchivedUsers() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Fetching archived users');
        // Query archives collection for users
        const archivesRef = collection(db, 'archives');
        const q = query(
          archivesRef, 
          where('itemType', '==', 'user'),
          orderBy('archivedAt', 'desc')
        );
        const archivesSnapshot = await getDocs(q);
        
        if (!archivesSnapshot.empty) {
          const archivedUsersData = archivesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log('Fetched archived users data:', archivedUsersData);
          this.archivedUsers = archivedUsersData;
          return archivedUsersData;
        } else {
          console.log('No archived users found');
          this.archivedUsers = [];
          return [];
        }
      } catch (error) {
        console.error('Error fetching archived users:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },

    /**
     * Restore an archived user
     * @param {string} archiveId - The ID of the archived user to restore
     * @returns {boolean} - Success status
     */
    async restoreArchivedUser(archiveId) {
      this.loading = true;
      this.error = null;
      
      try {
        // Use the existing restoreArchivedItem method since it now handles users
        const result = await this.restoreArchivedItem(archiveId);
        
        // Refresh the archived users list
        if (result) {
          await this.fetchArchivedUsers();
        }
        
        return result;
      } catch (error) {
        console.error('Error restoring archived user:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Permanently delete an archived user
     * @param {string} archiveId - The ID of the archived user to delete
     * @returns {boolean} - Success status
     */
    async permanentlyDeleteArchivedUser(archiveId) {
      this.loading = true;
      this.error = null;
      
      try {
        // Use the existing permanentlyDeleteArchivedItem method
        const result = await this.permanentlyDeleteArchivedItem(archiveId);
        
        // Refresh the archived users list
        if (result) {
          await this.fetchArchivedUsers();
        }
        
        return result;
      } catch (error) {
        console.error('Error permanently deleting archived user:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    }
  },

  getters: {
    getArchivedItems: (state) => state.archivedItems,
    getArchivedItemCount: (state) => state.archivedItems.length,
    getArchivedUsers: (state) => state.archivedUsers,
    getArchivedUserCount: (state) => state.archivedUsers.length,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getSelectedArchivedItem: (state) => state.selectedArchivedItem
  }
});