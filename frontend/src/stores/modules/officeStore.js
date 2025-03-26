// stores/modules/officeStore.js
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
import { db } from '@shared/firebase';
import { useArchivesStore } from './archivesStore';

export const useOfficeStore = defineStore('office', {
  state: () => ({
    officeHours: [],
    holidays: [],
    contacts: [],
    loading: false,
    error: null,
    selectedOfficeHours: null,
    selectedHoliday: null,
    selectedContact: null,
    archivesStore: useArchivesStore() // Initialize archivesStore here
  }),

  actions: {
    /**
     * Fetch all office hours
     * @returns {Array} - Array of office hours objects
     */
    async fetchOfficeHours() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Fetching office hours');
        // Query officeHours collection
        const officeHoursRef = collection(db, 'officeHours');
        const officeHoursSnapshot = await getDocs(officeHoursRef);
        
        if (!officeHoursSnapshot.empty) {
          const officeHoursData = officeHoursSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Sort by day of week
          const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          officeHoursData.sort((a, b) => {
            return weekdays.indexOf(a.day) - weekdays.indexOf(b.day);
          });
          
          console.log('Fetched office hours data:', officeHoursData);
          this.officeHours = officeHoursData;
          return officeHoursData;
        } else {
          console.log('No office hours found');
          this.officeHours = [];
          return [];
        }
      } catch (error) {
        console.error('Error fetching office hours:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Add new office hours
     * @param {Object} officeHoursData - The office hours data to add
     * @returns {Object|null} - The added office hours object or null if failed
     */
    async createOfficeHours(officeHoursData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Check if day already exists
        const existingDay = this.officeHours.find(h => h.day === officeHoursData.day);
        if (existingDay) {
          throw new Error(`Office hours for ${officeHoursData.day} already exist`);
        }
        
        // Generate a dynamic document ID based on the day
        // This ensures each day has a predictable, unique ID
        const docId = `day_${officeHoursData.day.toLowerCase()}`;
        
        // Prepare data for Firestore
        const data = {
          id: docId, // Include the ID in the document data
          day: officeHoursData.day,
          isOpen: officeHoursData.isOpen,
          openTime: officeHoursData.isOpen ? officeHoursData.openTime : null,
          closeTime: officeHoursData.isOpen ? officeHoursData.closeTime : null,
          lunchStart: officeHoursData.isOpen && officeHoursData.hasLunchBreak ? officeHoursData.lunchStart : null,
          lunchEnd: officeHoursData.isOpen && officeHoursData.hasLunchBreak ? officeHoursData.lunchEnd : null,
          notes: officeHoursData.notes || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Add to Firestore with custom document ID
        const docRef = doc(db, 'officeHours', docId);
        await setDoc(docRef, data);
        
        // Add ID to the data
        const newOfficeHours = {
          id: docId,
          ...data
        };
        
        // Update local state
        this.officeHours.push(newOfficeHours);
        
        // Sort by day of week
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        this.officeHours.sort((a, b) => {
          return weekdays.indexOf(a.day) - weekdays.indexOf(b.day);
        });
        
        console.log('Office hours added successfully:', newOfficeHours);
        return newOfficeHours;
      } catch (error) {
        console.error('Error adding office hours:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update existing office hours
     * @param {string} id - The ID of the office hours to update
     * @param {Object} officeHoursData - The updated office hours data
     * @returns {boolean} - Success status
     */
    async updateOfficeHours(id, officeHoursData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Prepare data for Firestore
        const data = {
          id: id, // Include the ID in the document data
          day: officeHoursData.day,
          isOpen: officeHoursData.isOpen,
          openTime: officeHoursData.isOpen ? officeHoursData.openTime : null,
          closeTime: officeHoursData.isOpen ? officeHoursData.closeTime : null,
          lunchStart: officeHoursData.isOpen && officeHoursData.hasLunchBreak ? officeHoursData.lunchStart : null,
          lunchEnd: officeHoursData.isOpen && officeHoursData.hasLunchBreak ? officeHoursData.lunchEnd : null,
          notes: officeHoursData.notes || '',
          updatedAt: serverTimestamp()
        };
        
        // Update in Firestore
        const docRef = doc(db, 'officeHours', id);
        await updateDoc(docRef, data);
        
        // Update local state
        const index = this.officeHours.findIndex(h => h.id === id);
        if (index !== -1) {
          this.officeHours[index] = {
            ...this.officeHours[index],
            ...data
          };
        }
        
        console.log('Office hours updated successfully:', id);
        return true;
      } catch (error) {
        console.error('Error updating office hours:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Archive office hours instead of deleting
     * @param {string} id - The ID of the office hours to archive
     * @returns {boolean} - Success status
     */
    async deleteOfficeHours(id) {
      this.loading = true;
      this.error = null;
      
      try {
        // Get the office hours data
        const docRef = doc(db, 'officeHours', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Office hours not found');
        }
        
        const officeHoursData = docSnap.data();
        
        // Save to archives collection
        await this.archivesStore.saveToArchivesCollection({
          ...officeHoursData,
          originalId: id,
          itemType: 'officeHours',
          archivedAt: new Date()
        });
        
        // Delete from officeHours collection
        await deleteDoc(docRef);
        
        // Update local state
        this.officeHours = this.officeHours.filter(h => h.id !== id);
        
        console.log('Office hours archived successfully:', id);
        return true;
      } catch (error) {
        console.error('Error archiving office hours:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Get office hours by ID
     * @param {string} id - The ID of the office hours to get
     * @returns {Object|null} - The office hours object or null if not found
     */
    async getOfficeHoursById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const docRef = doc(db, 'officeHours', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const officeHoursData = {
            id: docSnap.id,
            ...docSnap.data()
          };
          
          this.selectedOfficeHours = officeHoursData;
          return officeHoursData;
        } else {
          console.log('No office hours found with ID:', id);
          return null;
        }
      } catch (error) {
        console.error('Error getting office hours:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Fetch all holidays
     * @returns {Array} - Array of holiday objects
     */
    async fetchHolidays() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Fetching holidays');
        // Query holidays collection
        const holidaysRef = collection(db, 'holidays');
        const q = query(holidaysRef, orderBy('date'));
        const holidaysSnapshot = await getDocs(q);
        
        if (!holidaysSnapshot.empty) {
          const holidaysData = holidaysSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log('Fetched holidays data:', holidaysData);
          this.holidays = holidaysData;
          return holidaysData;
        } else {
          console.log('No holidays found');
          this.holidays = [];
          return [];
        }
      } catch (error) {
        console.error('Error fetching holidays:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Add a new holiday
     * @param {Object} holidayData - The holiday data to add
     * @returns {Object|null} - The added holiday object or null if failed
     */
    async createHoliday(holidayData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Generate a dynamic document ID based on the holiday name and date
        // This creates a more readable and predictable ID
        const dateStr = holidayData.date.replace(/-/g, '');
        const nameSlug = holidayData.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
        const docId = `holiday_${dateStr}_${nameSlug}`;
        
        // Prepare data for Firestore
        const data = {
          id: docId, // Include the ID in the document data
          name: holidayData.name,
          date: holidayData.date,
          isRecurringYearly: holidayData.isRecurringYearly || false,
          type: holidayData.type || 'holiday',
          openTime: holidayData.type === 'special-hours' ? holidayData.openTime : null,
          closeTime: holidayData.type === 'special-hours' ? holidayData.closeTime : null,
          description: holidayData.description || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Add to Firestore with custom document ID
        const docRef = doc(db, 'holidays', docId);
        await setDoc(docRef, data);
        
        // Add ID to the data
        const newHoliday = {
          id: docId,
          ...data
        };
        
        // Update local state
        this.holidays.push(newHoliday);
        
        // Sort by date
        this.holidays.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        
        console.log('Holiday added successfully:', newHoliday);
        return newHoliday;
      } catch (error) {
        console.error('Error adding holiday:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update an existing holiday
     * @param {string} id - The ID of the holiday to update
     * @param {Object} holidayData - The updated holiday data
     * @returns {boolean} - Success status
     */
    async updateHoliday(id, holidayData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Prepare data for Firestore
        const data = {
          id: id, // Include the ID in the document data
          name: holidayData.name,
          date: holidayData.date,
          isRecurringYearly: holidayData.isRecurringYearly || false,
          type: holidayData.type || 'holiday',
          openTime: holidayData.type === 'special-hours' ? holidayData.openTime : null,
          closeTime: holidayData.type === 'special-hours' ? holidayData.closeTime : null,
          description: holidayData.description || '',
          updatedAt: serverTimestamp()
        };
        
        // Update in Firestore
        const docRef = doc(db, 'holidays', id);
        await updateDoc(docRef, data);
        
        // Update local state
        const index = this.holidays.findIndex(h => h.id === id);
        if (index !== -1) {
          this.holidays[index] = {
            ...this.holidays[index],
            ...data
          };
        }
        
        // Sort by date
        this.holidays.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        
        console.log('Holiday updated successfully:', id);
        return true;
      } catch (error) {
        console.error('Error updating holiday:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Archive a holiday instead of deleting
     * @param {string} id - The ID of the holiday to archive
     * @returns {boolean} - Success status
     */
    async deleteHoliday(id) {
      this.loading = true;
      this.error = null;
      
      try {
        // Get the holiday data
        const docRef = doc(db, 'holidays', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Holiday not found');
        }
        
        const holidayData = docSnap.data();
        
        // Save to archives collection
        await this.archivesStore.saveToArchivesCollection({
          ...holidayData,
          originalId: id,
          itemType: 'holiday',
          archivedAt: new Date()
        });
        
        // Delete from holidays collection
        await deleteDoc(docRef);
        
        // Update local state
        this.holidays = this.holidays.filter(h => h.id !== id);
        
        console.log('Holiday archived successfully:', id);
        return true;
      } catch (error) {
        console.error('Error archiving holiday:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Get a holiday by ID
     * @param {string} id - The ID of the holiday to get
     * @returns {Object|null} - The holiday object or null if not found
     */
    async getHolidayById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const docRef = doc(db, 'holidays', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const holidayData = {
            id: docSnap.id,
            ...docSnap.data()
          };
          
          this.selectedHoliday = holidayData;
          return holidayData;
        } else {
          console.log('No holiday found with ID:', id);
          return null;
        }
      } catch (error) {
        console.error('Error getting holiday:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Fetch all office contacts
     * @returns {Array} - Array of contact objects
     */
    async fetchContacts() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Fetching office contacts');
        // Query contacts collection
        const contactsRef = collection(db, 'officeContacts');
        const contactsSnapshot = await getDocs(contactsRef);
        
        if (!contactsSnapshot.empty) {
          const contactsData = contactsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Sort by type and then by label
          contactsData.sort((a, b) => {
            return a.type.localeCompare(b.type) || a.label.localeCompare(b.label);
          });
          
          console.log('Fetched contacts data:', contactsData);
          this.contacts = contactsData;
          return contactsData;
        } else {
          console.log('No contacts found');
          this.contacts = [];
          return [];
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Add a new contact
     * @param {Object} contactData - The contact data to add
     * @returns {Object|null} - The added contact object or null if failed
     */
    async createContact(contactData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Generate a very short ID using just type initial and a timestamp hash
        const typeChar = contactData.type.charAt(0).toLowerCase();
        // Get current timestamp and convert to a shorter hash-like string
        const timestamp = Date.now();
        // Use just the last 4 digits for uniqueness
        const shortId = timestamp.toString().slice(-4);
        // Final ID format: c{type initial}{4-digit number}
        const docId = `c${typeChar}${shortId}`;
        
        // Prepare data for Firestore
        const data = {
          id: docId, // Include the ID in the document data
          type: contactData.type,
          value: contactData.value,
          label: contactData.label,
          isActive: contactData.isActive,
          notes: contactData.notes || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Add to Firestore with custom document ID
        const docRef = doc(db, 'officeContacts', docId);
        await setDoc(docRef, data);
        
        // Add ID to the data
        const newContact = {
          id: docId,
          ...data
        };
        
        // Update local state
        this.contacts.push(newContact);
        
        // Sort by type and label
        this.contacts.sort((a, b) => {
          return a.type.localeCompare(b.type) || a.label.localeCompare(b.label);
        });
        
        console.log('Contact added successfully:', newContact);
        return newContact;
      } catch (error) {
        console.error('Error adding contact:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update an existing contact
     * @param {string} id - The ID of the contact to update
     * @param {Object} contactData - The updated contact data
     * @returns {boolean} - Success status
     */
    async updateContact(id, contactData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Prepare data for Firestore
        const data = {
          id: id, // Include the ID in the document data
          type: contactData.type,
          value: contactData.value,
          label: contactData.label,
          isActive: contactData.isActive,
          notes: contactData.notes || '',
          updatedAt: serverTimestamp()
        };
        
        // Update in Firestore
        const docRef = doc(db, 'officeContacts', id);
        await updateDoc(docRef, data);
        
        // Update local state
        const index = this.contacts.findIndex(c => c.id === id);
        if (index !== -1) {
          this.contacts[index] = {
            ...this.contacts[index],
            ...data
          };
        }
        
        // Sort by type and label
        this.contacts.sort((a, b) => {
          return a.type.localeCompare(b.type) || a.label.localeCompare(b.label);
        });
        
        console.log('Contact updated successfully:', id);
        return true;
      } catch (error) {
        console.error('Error updating contact:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Archive a contact instead of deleting
     * @param {string} id - The ID of the contact to archive
     * @returns {boolean} - Success status
     */
    async deleteContact(id) {
      this.loading = true;
      this.error = null;
      
      try {
        // Get the contact data
        const docRef = doc(db, 'officeContacts', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Contact not found');
        }
        
        const contactData = docSnap.data();
        
        // Save to archives collection
        await this.archivesStore.saveToArchivesCollection({
          ...contactData,
          originalId: id,
          itemType: 'contact',
          archivedAt: new Date()
        });
        
        // Delete from officeContacts collection
        await deleteDoc(docRef);
        
        // Update local state
        this.contacts = this.contacts.filter(c => c.id !== id);
        
        console.log('Contact archived successfully:', id);
        return true;
      } catch (error) {
        console.error('Error archiving contact:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Get a contact by ID
     * @param {string} id - The ID of the contact to get
     * @returns {Object|null} - The contact object or null if not found
     */
    async getContactById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const docRef = doc(db, 'officeContacts', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const contactData = {
            id: docSnap.id,
            ...docSnap.data()
          };
          
          this.selectedContact = contactData;
          return contactData;
        } else {
          console.log('No contact found with ID:', id);
          return null;
        }
      } catch (error) {
        console.error('Error getting contact:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Check if a specific date is a holiday or has special hours
     * @param {string} date - The date to check in YYYY-MM-DD format
     * @returns {Object|null} - The holiday object or null if not a holiday
     */
    checkHolidayStatus(date) {
      // Convert input date to Date object
      const checkDate = new Date(date);
      const checkMonth = checkDate.getMonth();
      const checkDay = checkDate.getDate();
      
      // Check for exact date match or recurring yearly match
      const holiday = this.holidays.find(h => {
        const holidayDate = new Date(h.date);
        
        // Check for exact date match
        if (holidayDate.toISOString().split('T')[0] === checkDate.toISOString().split('T')[0]) {
          return true;
        }
        
        // Check for recurring yearly match (month and day match)
        if (h.isRecurringYearly && 
            holidayDate.getMonth() === checkMonth && 
            holidayDate.getDate() === checkDay) {
          return true;
        }
        
        return false;
      });
      
      return holiday || null;
    },
    
    /**
     * Get office hours for a specific day of the week
     * @param {string} dayOfWeek - The day of the week (Monday, Tuesday, etc.)
     * @returns {Object|null} - The office hours object or null if not found
     */
    getOfficeHoursForDay(dayOfWeek) {
      return this.officeHours.find(h => h.day === dayOfWeek) || null;
    },
    
    /**
     * Check if the office is open on a specific date and time
     * @param {string} date - The date to check in YYYY-MM-DD format
     * @param {string} time - The time to check in HH:MM format
     * @returns {boolean} - True if the office is open, false otherwise
     */
    isOfficeOpenAt(date, time) {
      // First check if it's a holiday
      const holiday = this.checkHolidayStatus(date);
      
      if (holiday) {
        // If it's a holiday with special hours, check if the time is within those hours
        if (holiday.type === 'special-hours' && holiday.openTime && holiday.closeTime) {
          return this.isTimeWithinRange(time, holiday.openTime, holiday.closeTime);
        }
        
        // If it's a regular holiday, the office is closed
        return false;
      }
      
      // If it's not a holiday, check regular office hours
      const checkDate = new Date(date);
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][checkDate.getDay()];
      const officeHours = this.getOfficeHoursForDay(dayOfWeek);
      
      if (!officeHours || !officeHours.isOpen) {
        return false;
      }
      
      // Check if the time is within office hours
      if (!this.isTimeWithinRange(time, officeHours.openTime, officeHours.closeTime)) {
        return false;
      }
      
      // Check if the time is during lunch break
      if (officeHours.lunchStart && officeHours.lunchEnd) {
        if (this.isTimeWithinRange(time, officeHours.lunchStart, officeHours.lunchEnd)) {
          return false;
        }
      }
      
      return true;
    },
    
    /**
     * Helper function to check if a time is within a range
     * @param {string} time - The time to check in HH:MM format
     * @param {string} startTime - The start time in HH:MM format
     * @param {string} endTime - The end time in HH:MM format
     * @returns {boolean} - True if the time is within the range, false otherwise
     */
    isTimeWithinRange(time, startTime, endTime) {
      // Convert times to minutes for easier comparison
      const timeMinutes = this.convertTimeToMinutes(time);
      const startMinutes = this.convertTimeToMinutes(startTime);
      const endMinutes = this.convertTimeToMinutes(endTime);
      
      return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
    },
    
    /**
     * Helper function to convert time to minutes
     * @param {string} time - The time in HH:MM format
     * @returns {number} - The time in minutes
     */
    convertTimeToMinutes(time) {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    }
  },

  getters: {
    // Office Hours getters
    getOfficeHours: (state) => state.officeHours,
    getOpenDays: (state) => state.officeHours.filter(h => h.isOpen),
    getClosedDays: (state) => state.officeHours.filter(h => !h.isOpen),
    
    // Holidays getters
    getHolidays: (state) => state.holidays,
    getUpcomingHolidays: (state) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return state.holidays.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate >= today;
      }).sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    // Contacts getters
    getContacts: (state) => state.contacts,
    getActiveContacts: (state) => state.contacts.filter(c => c.isActive),
    getContactsByType: (state) => (type) => {
      return state.contacts.filter(c => c.type === type);
    },
    
    // Status getters
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  }
});