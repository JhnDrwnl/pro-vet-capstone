// stores/modules/appointmentStore.js
import { defineStore } from 'pinia';
import { getFirestore } from 'firebase/firestore';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc,  
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { format, isToday, isThisWeek, isThisMonth, parseISO, isBefore } from 'date-fns';

export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
    appointments: [],
    currentAppointment: null,
    loading: false,
    error: null,
    lastVisible: null,
    hasMore: true
  }),

  getters: {
    getAppointmentById: (state) => (id) => {
      return state.appointments.find(appointment => appointment.id === id) || null;
    },
    
    getAppointmentsByUserId: (state) => (userId) => {
      return state.appointments.filter(appointment => appointment.userId === userId);
    },
    
    getAppointmentsByDoctorId: (state) => (doctorId) => {
      return state.appointments.filter(appointment => appointment.doctorId === doctorId);
    },
    
    getAppointmentsByStatus: (state) => (status) => {
      return state.appointments.filter(appointment => appointment.status === status);
    },
    
    getTodayAppointments: (state) => {
      return state.appointments.filter(appointment => {
        const appointmentDate = appointment.date instanceof Date 
          ? appointment.date 
          : new Date(appointment.date);
        return isToday(appointmentDate);
      });
    },
    
    getThisWeekAppointments: (state) => {
      return state.appointments.filter(appointment => {
        const appointmentDate = appointment.date instanceof Date 
          ? appointment.date 
          : new Date(appointment.date);
        return isThisWeek(appointmentDate);
      });
    },
    
    getThisMonthAppointments: (state) => {
      return state.appointments.filter(appointment => {
        const appointmentDate = appointment.date instanceof Date 
          ? appointment.date 
          : new Date(appointment.date);
        return isThisMonth(appointmentDate);
      });
    },
    
    getUpcomingAppointments: (state) => {
      const now = new Date();
      return state.appointments.filter(appointment => {
        const appointmentDate = appointment.date instanceof Date 
          ? appointment.date 
          : new Date(appointment.date);
        return appointmentDate > now;
      }).sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateA - dateB;
      });
    },
    
    getPastAppointments: (state) => {
      const now = new Date();
      return state.appointments.filter(appointment => {
        const appointmentDate = appointment.date instanceof Date 
          ? appointment.date 
          : new Date(appointment.date);
        return appointmentDate < now;
      }).sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateB - dateA; // Sort in descending order (newest first)
      });
    }
  },

  actions: {
    /**
     * Parse appointment time and get the end time as a Date object
     * @param {Object} appointment - The appointment object
     * @returns {Date|null} - The appointment end time as a Date object or null if parsing fails
     */
    parseAppointmentEndTime(appointment) {
      const appointmentDate = appointment.date instanceof Date 
        ? appointment.date 
        : new Date(appointment.date);
      
      // Parse the appointment time (e.g., "4:00 PM - 4:20 PM")
      if (appointment.time) {
        const timeMatch = appointment.time.match(/(\d+:\d+\s*[APM]+)\s*-\s*(\d+:\d+\s*[APM]+)/i);
        if (timeMatch && timeMatch[2]) {
          // Get the end time part
          const endTimeStr = timeMatch[2].trim();
          
          // Create a date object for the appointment end time
          const endTimeParts = endTimeStr.match(/(\d+):(\d+)\s*([APM]+)/i);
          if (endTimeParts) {
            let hours = parseInt(endTimeParts[1]);
            const minutes = parseInt(endTimeParts[2]);
            const period = endTimeParts[3].toUpperCase();
            
            // Convert to 24-hour format
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            const endTime = new Date(appointmentDate);
            endTime.setHours(hours, minutes, 0, 0);
            return endTime;
          }
        }
      }
      
      // If we couldn't parse the end time, return null
      return null;
    },

    /**
     * Check for expired appointments and update their status to "ended"
     * @returns {Array} - Array of updated appointment IDs
     */
    async checkExpiredAppointments() {
      try {
        const now = new Date();
        const updatedAppointmentIds = [];
        
        // Find appointments that are in the past and still pending
        // Only mark as "ended" if they are pending (not approved or cancelled)
        const expiredAppointments = this.appointments.filter(appointment => {
          // Get appointment date
          const appointmentDate = appointment.date instanceof Date 
            ? appointment.date 
            : new Date(appointment.date);
          
          // Get appointment end time
          const appointmentEndTime = this.parseAppointmentEndTime(appointment) || appointmentDate;
          
          // Check if the appointment end time has passed and it's still pending
          // Only mark as "ended" if status is pending (not approved or cancelled)
          return isBefore(appointmentEndTime, now) && appointment.status === 'pending';
        });
        
        // Update each expired appointment
        for (const appointment of expiredAppointments) {
          await this.updateAppointment(appointment.id, {
            status: 'ended',
            endedAt: new Date(),
            endedReason: 'Appointment time has passed',
            endedBy: 'system'
          });
          
          updatedAppointmentIds.push(appointment.id);
        }
        
        return updatedAppointmentIds;
      } catch (error) {
        console.error('Error checking expired appointments:', error);
        this.error = error.message;
        return [];
      }
    },
    
    /**
     * Fetch all appointments
     * @param {number} limitCount - Number of appointments to fetch
     * @returns {Array} - Array of appointments
     */
    async fetchAppointments(limitCount = 20) {
      this.loading = true;
      this.error = null;
      
      try {
        const db = getFirestore();
        const appointmentsRef = collection(db, 'appointments');
        
        let appointmentsQuery;
        
        if (this.lastVisible && this.hasMore) {
          appointmentsQuery = query(
            appointmentsRef,
            orderBy('createdAt', 'desc'),
            startAfter(this.lastVisible),
            limit(limitCount)
          );
        } else {
          // Reset pagination when fetching from the beginning
          this.lastVisible = null;
          appointmentsQuery = query(
            appointmentsRef,
            orderBy('createdAt', 'desc'),
            limit(limitCount)
          );
        }
        
        const querySnapshot = await getDocs(appointmentsQuery);
        
        // Update pagination state
        if (querySnapshot.docs.length > 0) {
          this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
          this.hasMore = querySnapshot.docs.length === limitCount;
        } else {
          this.hasMore = false;
        }
        
        const appointments = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Convert Firestore timestamps to JavaScript Date objects
          const formattedData = {
            id: doc.id,
            ...data,
            date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
          };
          
          appointments.push(formattedData);
        });
        
        // If this is the first page, replace the appointments array
        // Otherwise, append to the existing array
        if (!this.lastVisible || querySnapshot.docs.length === 0) {
          this.appointments = appointments;
        } else {
          this.appointments = [...this.appointments, ...appointments];
        }
        
        // Check for expired appointments after fetching
        await this.checkExpiredAppointments();
        
        return appointments;
      } catch (error) {
        console.error('Error fetching appointments:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Fetch appointments by user ID
     * @param {string} userId - The user ID
     * @returns {Array} - Array of appointments
     */
    async fetchAppointmentsByUserId(userId) {
      this.loading = true;
      this.error = null;
      
      try {
        const db = getFirestore();
        const appointmentsRef = collection(db, 'appointments');
        const appointmentsQuery = query(
          appointmentsRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(appointmentsQuery);
        const appointments = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Convert Firestore timestamps to JavaScript Date objects
          const formattedData = {
            id: doc.id,
            ...data,
            date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
          };
          
          appointments.push(formattedData);
        });
        
        this.appointments = appointments;
        
        // Check for expired appointments after fetching
        await this.checkExpiredAppointments();
        
        return appointments;
      } catch (error) {
        console.error('Error fetching appointments by user ID:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Fetch appointments by doctor ID
     * @param {string} doctorId - The doctor ID
     * @returns {Array} - Array of appointments
     */
    async fetchAppointmentsByDoctorId(doctorId) {
      this.loading = true;
      this.error = null;
      
      try {
        const db = getFirestore();
        const appointmentsRef = collection(db, 'appointments');
        const appointmentsQuery = query(
          appointmentsRef,
          where('doctorId', '==', doctorId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(appointmentsQuery);
        const appointments = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Convert Firestore timestamps to JavaScript Date objects
          const formattedData = {
            id: doc.id,
            ...data,
            date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
          };
          
          appointments.push(formattedData);
        });
        
        // Check for expired appointments after fetching
        await this.checkExpiredAppointments();
        
        return appointments;
      } catch (error) {
        console.error('Error fetching appointments by doctor ID:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Fetch appointments by date
     * @param {Date} date - The date to fetch appointments for
     * @returns {Array} - Array of appointments
     */
    async fetchAppointmentsByDate(date) {
      this.loading = true;
      this.error = null;
      
      try {
        // Format the date to YYYY-MM-DD for consistent comparison
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        const db = getFirestore();
        const appointmentsRef = collection(db, 'appointments');
        
        // We need to get all appointments and filter by date
        // since Firestore doesn't support direct date equality queries
        const appointmentsQuery = query(appointmentsRef);
        
        const querySnapshot = await getDocs(appointmentsQuery);
        const appointments = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Convert Firestore timestamp to JavaScript Date
          const appointmentDate = data.date instanceof Timestamp 
            ? data.date.toDate() 
            : new Date(data.date);
          
          // Format the appointment date to YYYY-MM-DD for comparison
          const appointmentFormattedDate = format(appointmentDate, 'yyyy-MM-dd');
          
          // Only include appointments for the specified date
          if (appointmentFormattedDate === formattedDate) {
            // Convert Firestore timestamps to JavaScript Date objects
            const formattedData = {
              id: doc.id,
              ...data,
              date: appointmentDate,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
              updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
            };
            
            appointments.push(formattedData);
          }
        });
        
        // Check for expired appointments after fetching
        await this.checkExpiredAppointments();
        
        return appointments;
      } catch (error) {
        console.error('Error fetching appointments by date:', error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Fetch a single appointment by ID
     * @param {string} id - The appointment ID
     * @returns {Object|null} - The appointment object or null if not found
     */
    async fetchAppointmentById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const db = getFirestore();
        const appointmentRef = doc(db, 'appointments', id);
        const appointmentDoc = await getDoc(appointmentRef);
        
        if (appointmentDoc.exists()) {
          const data = appointmentDoc.data();
          
          // Convert Firestore timestamps to JavaScript Date objects
          const formattedData = {
            id: appointmentDoc.id,
            ...data,
            date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
          };
          
          this.currentAppointment = formattedData;
          
          // Check if this appointment is expired
          const now = new Date();
          
          // Get appointment end time
          const appointmentEndTime = this.parseAppointmentEndTime(formattedData);
          
          // Only mark as "ended" if status is pending (not approved or cancelled)
          if (appointmentEndTime && 
              isBefore(appointmentEndTime, now) && 
              formattedData.status === 'pending') {
            await this.updateAppointment(id, {
              status: 'ended',
              endedAt: new Date(),
              endedReason: 'Appointment time has passed',
              endedBy: 'system'
            });
            
            // Refresh the appointment data after update
            const updatedDoc = await getDoc(appointmentRef);
            const updatedData = updatedDoc.data();
            
            const updatedFormattedData = {
              id: updatedDoc.id,
              ...updatedData,
              date: updatedData.date instanceof Timestamp ? updatedData.date.toDate() : updatedData.date,
              createdAt: updatedData.createdAt instanceof Timestamp ? updatedData.createdAt.toDate() : updatedData.createdAt,
              updatedAt: updatedData.updatedAt instanceof Timestamp ? updatedData.updatedAt.toDate() : updatedData.updatedAt
            };
            
            this.currentAppointment = updatedFormattedData;
            return updatedFormattedData;
          }
          
          return formattedData;
        } else {
          this.currentAppointment = null;
          return null;
        }
      } catch (error) {
        console.error('Error fetching appointment by ID:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Add a new appointment with a custom document ID
     * @param {Object} appointmentData - The appointment data to add
     * @returns {Object|null} - The added appointment object or null if failed
     */
    async addAppointment(appointmentData) {
      this.loading = true;
      this.error = null;
      
      try {
        const db = getFirestore();
        
        // Generate a custom ID for the appointment
        // Format: APPT-{userId}-{timestamp}
        const timestamp = Date.now();
        const userId = appointmentData.userId || 'guest';
        const customId = `APPT-${userId.substring(0, 8)}-${timestamp}`;
        
        // Reference to the specific document with our custom ID
        const appointmentRef = doc(db, 'appointments', customId);
        
        // Add timestamps to the appointment data
        const appointmentWithMetadata = {
          ...appointmentData,
          id: customId, // Include the ID in the document data for easier access
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Save to Firestore using setDoc instead of addDoc
        await setDoc(appointmentRef, appointmentWithMetadata);
        
        console.log('Appointment added successfully with ID:', customId);
        
        // Get the newly created document to include server-generated fields
        const newAppointmentDoc = await getDoc(appointmentRef);
        const newAppointmentData = newAppointmentDoc.data();
        
        // Convert Firestore timestamps to JavaScript Date objects
        const formattedData = {
          id: customId,
          ...newAppointmentData,
          date: newAppointmentData.date instanceof Timestamp ? newAppointmentData.date.toDate() : newAppointmentData.date,
          createdAt: newAppointmentData.createdAt instanceof Timestamp ? newAppointmentData.createdAt.toDate() : new Date(),
          updatedAt: newAppointmentData.updatedAt instanceof Timestamp ? newAppointmentData.updatedAt.toDate() : new Date()
        };
        
        // Update local state
        this.appointments.unshift(formattedData);
        return formattedData;
      } catch (error) {
        console.error('Error adding appointment:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update an existing appointment
     * @param {string} id - The appointment ID
     * @param {Object} appointmentData - The updated appointment data
     * @returns {Object|null} - The updated appointment object or null if failed
     */
    async updateAppointment(id, appointmentData) {
      this.loading = true;
      this.error = null;
      
      try {
        const db = getFirestore();
        const appointmentRef = doc(db, 'appointments', id);
        
        // Add updated timestamp
        const updatedData = {
          ...appointmentData,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(appointmentRef, updatedData);
        
        // Get the updated document
        const updatedAppointmentDoc = await getDoc(appointmentRef);
        const updatedAppointmentData = updatedAppointmentDoc.data();
        
        // Convert Firestore timestamps to JavaScript Date objects
        const formattedData = {
          id,
          ...updatedAppointmentData,
          date: updatedAppointmentData.date instanceof Timestamp ? updatedAppointmentData.date.toDate() : updatedAppointmentData.date,
          createdAt: updatedAppointmentData.createdAt instanceof Timestamp ? updatedAppointmentData.createdAt.toDate() : updatedAppointmentData.createdAt,
          updatedAt: updatedAppointmentData.updatedAt instanceof Timestamp ? updatedAppointmentData.updatedAt.toDate() : new Date()
        };
        
        // Update local state
        const index = this.appointments.findIndex(appointment => appointment.id === id);
        if (index !== -1) {
          this.appointments[index] = formattedData;
        }
        
        if (this.currentAppointment && this.currentAppointment.id === id) {
          this.currentAppointment = formattedData;
        }
        
        return formattedData;
      } catch (error) {
        console.error('Error updating appointment:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Delete an appointment
     * @param {string} id - The appointment ID
     * @returns {boolean} - True if successful, false otherwise
     */
    async deleteAppointment(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const db = getFirestore();
        const appointmentRef = doc(db, 'appointments', id);
        
        await deleteDoc(appointmentRef);
        
        // Update local state
        this.appointments = this.appointments.filter(appointment => appointment.id !== id);
        
        if (this.currentAppointment && this.currentAppointment.id === id) {
          this.currentAppointment = null;
        }
        
        return true;
      } catch (error) {
        console.error('Error deleting appointment:', error);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update appointment status
     * @param {string} id - The appointment ID
     * @param {string} status - The new status
     * @returns {Object|null} - The updated appointment object or null if failed
     */
    async updateAppointmentStatus(id, status) {
      return this.updateAppointment(id, { status });
    },
    
    /**
     * Clear all appointments from state
     */
    clearAppointments() {
      this.appointments = [];
      this.currentAppointment = null;
      this.error = null;
      this.loading = false;
      this.lastVisible = null;
      this.hasMore = true;
    }
  }
});