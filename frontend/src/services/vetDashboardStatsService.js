// services/vetDashboardStatsService.js
import { getFirestore } from 'firebase/firestore';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  limit
} from 'firebase/firestore';
import { 
  startOfMonth as dateStartOfMonth, 
  endOfMonth as dateEndOfMonth, 
  startOfDay, 
  endOfDay, 
  format, 
  subMonths,
  subDays,
  subWeeks,
  endOfWeek,
} from 'date-fns';

export class VetDashboardStatsService {
  constructor() {
    this.db = getFirestore();
  }

  /**
   * Get appointment statistics for the vet dashboard
   * @param {string} doctorId - The vet's doctor ID
   * @param {number} periodMonths - Number of months to look back (1, 3, 6, or 12)
   * @returns {Object} Dashboard statistics
   */
  async getVetDashboardStats(doctorId, periodMonths = 1) {
    try {
      let endDate = new Date();
      let startDate;
      
      // For current month, use from 1st day of current month to today
      if (periodMonths === 1) {
        // Get the 1st day of current month
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        // Adjust for timezone - make the range more inclusive
        startDate = startOfDay(startDate);
        endDate = endOfDay(endDate);
        
        // Adjust for UTC+8 timezone - add 8 hours to ensure we capture the full day
        startDate = new Date(startDate.getTime() - (8 * 60 * 60 * 1000));
        endDate = new Date(endDate.getTime() + (8 * 60 * 60 * 1000));
      } else {
        startDate = subMonths(endDate, periodMonths);
      }
      

      
      // Get all appointments for the selected period for this specific vet
      const appointments = await this.getVetAppointmentsForPeriod(doctorId, startDate, endDate);
      

      
      // Get previous period for comparison (equivalent length period before the current period)
      let prevPeriodStart, prevPeriodEnd;
      if (periodMonths === 1) {
        // For current month comparison, use the previous month
        const currentMonthStart = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        prevPeriodEnd = currentMonthStart;
        prevPeriodStart = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
      } else {
        prevPeriodEnd = startDate;
        prevPeriodStart = subMonths(startDate, periodMonths);
      }
      const prevPeriodAppointments = await this.getVetAppointmentsForPeriod(doctorId, prevPeriodStart, prevPeriodEnd);
      

      
      // Calculate statistics
      const stats = {
        totalAppointments: appointments.length,
        approvedAppointments: appointments.filter(apt => apt.status === 'approved').length,
        pendingAppointments: appointments.filter(apt => apt.status === 'pending').length,
        completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
        cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
        onlineSessions: this.getOnlineSessions(appointments),
        walkInSessions: this.getWalkInSessions(appointments),
        todayAppointments: await this.getVetTodayAppointments(doctorId),
        petDistribution: await this.getVetPetDistribution(appointments),
        monthlyTrend: await this.getVetMonthlyTrend(doctorId, periodMonths),
        recentActivities: await this.getVetRecentActivities(doctorId),
        comparisonStats: this.calculateVetComparisonStats(appointments, prevPeriodAppointments)
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching vet dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get appointments for a specific vet and time period
   * @param {string} doctorId - The vet's doctor ID
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @returns {Array} Array of appointments
   */
  async getVetAppointmentsForPeriod(doctorId, startDate, endDate) {
    try {
      const appointmentsRef = collection(this.db, 'appointments');
      const q = query(
        appointmentsRef,
        where('doctorId', '==', doctorId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const appointments = [];
      

      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const appointment = {
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
        };
        

        
        appointments.push(appointment);
      });
      

      
      return appointments;
    } catch (error) {
      console.error('Error fetching vet appointments for period:', error);
      return [];
    }
  }

  /**
   * Get pets data by IDs
   * @param {Array} petIds - Array of pet IDs
   * @returns {Array} Array of pet data
   */
  async getPetsData(petIds) {
    try {
      if (!petIds || petIds.length === 0) {
        return [];
      }

      const petsRef = collection(this.db, 'pets');
      const petsData = [];

      // Use 'in' query for better performance - fetch multiple pets in one query
      const uniquePetIds = [...new Set(petIds)];
      const batchSize = 10; // Firestore 'in' query limit
      
      for (let i = 0; i < uniquePetIds.length; i += batchSize) {
        const batch = uniquePetIds.slice(i, i + batchSize);
        
        // Single query for multiple pet IDs
        const q = query(petsRef, where('id', 'in', batch));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          petsData.push({
            id: data.id,
            name: data.name,
            species: data.species,
            breed: data.breed,
            gender: data.gender,
            ageYears: data.ageYears,
            ageMonths: data.ageMonths,
            ageWeeks: data.ageWeeks,
            weight: data.weight,
            status: data.status,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
          });
        });
      }

      return petsData;
    } catch (error) {
      console.error('Error fetching pets data:', error);
      return [];
    }
  }

  /**
   * Get today's appointments for the vet
   * @param {string} doctorId - The vet's doctor ID
   * @returns {Array} Today's appointments
   */
  async getVetTodayAppointments(doctorId) {
    try {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);
      
      // Adjust for UTC+8 timezone - add 8 hours to ensure we capture the full day
      const adjustedStartOfToday = new Date(startOfToday.getTime() - (8 * 60 * 60 * 1000));
      const adjustedEndOfToday = new Date(endOfToday.getTime() + (8 * 60 * 60 * 1000));
      
      
      
      const appointments = await this.getVetAppointmentsForPeriod(doctorId, adjustedStartOfToday, adjustedEndOfToday);
      

      
      // Get pet data for today's appointments
      const petIds = new Set();
      appointments.forEach(apt => {
        if (apt.petIds && Array.isArray(apt.petIds)) {
          apt.petIds.forEach(petId => petIds.add(petId));
        }
      });
      
      const petsData = await this.getPetsData(Array.from(petIds));
      
      // Format appointments for display
      return appointments.map(apt => {
        const petData = petsData.find(pet => pet.id === apt.petIds?.[0]);
        return {
          id: apt.id,
          petName: petData?.name || apt.petNames?.[0] || 'Unknown Pet',
          ownerName: apt.ownerName || 'Unknown Owner',
          service: apt.serviceNames?.[0] || 'Unknown Service',
          time: apt.time || 'No time specified',
          status: apt.status || 'pending',
          petType: petData?.species || 'Other',
          doctorName: apt.doctorName || 'Unknown Doctor'
        };
      });
    } catch (error) {
      console.error('Error fetching vet today\'s appointments:', error);
      return [];
    }
  }

  /**
   * Get pet distribution statistics for the vet
   * @param {Array} appointments 
   * @returns {Array} Pet distribution data
   */
  async getVetPetDistribution(appointments) {
    try {
      const petCounts = {};
      
      // Get unique pet IDs from all appointments
      const petIds = new Set();
      appointments.forEach(apt => {
        if (apt.petIds && Array.isArray(apt.petIds)) {
          apt.petIds.forEach(petId => petIds.add(petId));
        }
      });
      
      // Fetch pet data for all unique pet IDs
      const petsData = await this.getPetsData(Array.from(petIds));
      
      // Count pets by species
      appointments.forEach(apt => {
        if (apt.petIds && Array.isArray(apt.petIds)) {
          apt.petIds.forEach(petId => {
            const petData = petsData.find(pet => pet.id === petId);
            if (petData && petData.species) {
              const species = petData.species;
              petCounts[species] = (petCounts[species] || 0) + 1;
            }
          });
        }
      });
      
      // Convert to array format for charts
      const segments = [];
      const colors = {
        'Dog': '#ef4444',
        'Cat': '#f97316', 
        'Bird': '#3b82f6',
        'Rabbit': '#a855f7',
        'Hamster': '#22c55e',
        'Fish': '#06b6d4',
        'Other': '#eab308'
      };
      
      const totalPets = Object.values(petCounts).reduce((sum, count) => sum + count, 0);
      
      Object.entries(petCounts).forEach(([species, count]) => {
        const percentage = totalPets > 0 ? Math.round((count / totalPets) * 100) : 0;
        segments.push({
          label: species,
          value: count,
          color: colors[species] || '#6b7280',
          percentage: percentage.toString()
        });
      });
      
      // Sort by count descending
      segments.sort((a, b) => b.value - a.value);
      
      return segments;
    } catch (error) {
      console.error('Error calculating vet pet distribution:', error);
      return [];
    }
  }

  /**
   * Get monthly trend data for the specified vet and period
   * @param {string} doctorId - The vet's doctor ID
   * @param {number} periodMonths - Number of months to look back
   * @returns {Array} Monthly appointment counts
   */
  async getVetMonthlyTrend(doctorId, periodMonths) {
    try {
      const trendData = [];
      
      if (periodMonths === 1) {
        // For current month, show days from 1st to today
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        for (let day = 1; day <= today.getDate(); day++) {
          const dayDate = new Date(currentYear, currentMonth, day);
          const dayStart = startOfDay(dayDate);
          const dayEnd = endOfDay(dayDate);
          
          // Adjust for UTC+8 timezone
          const adjustedDayStart = new Date(dayStart.getTime() - (8 * 60 * 60 * 1000));
          const adjustedDayEnd = new Date(dayEnd.getTime() + (8 * 60 * 60 * 1000));
          
          const appointments = await this.getVetAppointmentsForPeriod(doctorId, adjustedDayStart, adjustedDayEnd);
          
          trendData.push({
            period: `${day}/${currentMonth + 1}`,
            count: appointments.length,
            date: dayDate
          });
        }
      } else if (periodMonths === 3) {
        // For 3 months, show last 12 weeks
        for (let i = 11; i >= 0; i--) {
          const weekStart = subWeeks(new Date(), i);
          const weekEnd = endOfWeek(weekStart);
          
          // Adjust for UTC+8 timezone
          const adjustedWeekStart = new Date(weekStart.getTime() - (8 * 60 * 60 * 1000));
          const adjustedWeekEnd = new Date(weekEnd.getTime() + (8 * 60 * 60 * 1000));
          
          const appointments = await this.getVetAppointmentsForPeriod(doctorId, adjustedWeekStart, adjustedWeekEnd);
          
          // Calculate week number based on the first day of the week
          const weekNumber = Math.ceil((weekStart.getDate() + weekStart.getDay()) / 7);
          
          // Use the month name from the week start date
          const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'][weekStart.getMonth()];
          
          trendData.push({
            period: `${monthName} W${weekNumber}`,
            count: appointments.length,
            date: weekStart
          });
        }
      } else {
        // For 6 and 12 months, show months
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        
        for (let i = periodMonths - 1; i >= 0; i--) {
          const monthDate = subMonths(new Date(), i);
          const monthStart = dateStartOfMonth(monthDate);
          const monthEnd = dateEndOfMonth(monthDate);
          
          // Adjust for UTC+8 timezone
          const adjustedMonthStart = new Date(monthStart.getTime() - (8 * 60 * 60 * 1000));
          const adjustedMonthEnd = new Date(monthEnd.getTime() + (8 * 60 * 60 * 1000));
          
          const appointments = await this.getVetAppointmentsForPeriod(doctorId, adjustedMonthStart, adjustedMonthEnd);
          
          trendData.push({
            period: months[monthDate.getMonth()],
            count: appointments.length,
            date: monthDate
          });
        }
      }
      
      return trendData;
    } catch (error) {
      console.error('Error fetching vet trend data:', error);
      return [];
    }
  }

  /**
   * Get recent activities for the vet
   * @param {string} doctorId - The vet's doctor ID
   * @returns {Array} Recent activities
   */
  async getVetRecentActivities(doctorId) {
    try {
      const appointmentsRef = collection(this.db, 'appointments');
      const q = query(
        appointmentsRef,
        where('doctorId', '==', doctorId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const activities = [];
      
      // Get pet IDs from recent appointments
      const petIds = new Set();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.petIds && Array.isArray(data.petIds)) {
          data.petIds.forEach(petId => petIds.add(petId));
        }
      });
      
      // Fetch pet data
      const petsData = await this.getPetsData(Array.from(petIds));

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt;
        
        // Get pet name from pets collection
        const petData = petsData.find(pet => pet.id === data.petIds?.[0]);
        const petName = petData?.name || data.petNames?.[0] || 'Unknown Pet';
        
        activities.push({
          id: doc.id,
          type: 'appointment',
          title: this.getActivityTitle(data.status),
          description: `${petName} - ${data.serviceNames?.[0] || 'Unknown Service'}`,
          time: this.getTimeAgo(createdAt),
          status: data.status,
          bgColor: this.getActivityBgColor(data.status),
          iconColor: this.getActivityIconColor(data.status)
        });
      });
      
      return activities.slice(0, 4); // Return only 4 most recent
    } catch (error) {
      console.error('Error fetching vet recent activities:', error);
      return [];
    }
  }

  /**
   * Get online sessions count (Video Consultation or Telehealth)
   * @param {Array} appointments 
   * @returns {number} Count of online sessions
   */
  getOnlineSessions(appointments) {
    return appointments.filter(apt => {
      // Check if any service name contains "Video Consultation" or "Telehealth"
      return apt.serviceNames && Array.isArray(apt.serviceNames) && 
             apt.serviceNames.some(service => {
               const serviceLower = service.toLowerCase();
               return serviceLower.includes('video consultation') || 
                      serviceLower.includes('telehealth');
             });
    }).length;
  }

  /**
   * Get walk-in sessions count (all other consultations)
   * @param {Array} appointments 
   * @returns {number} Count of walk-in sessions
   */
  getWalkInSessions(appointments) {
    return appointments.filter(apt => {
      // Check if service names do NOT contain "Video Consultation" or "Telehealth"
      return apt.serviceNames && Array.isArray(apt.serviceNames) && 
             !apt.serviceNames.some(service => {
               const serviceLower = service.toLowerCase();
               return serviceLower.includes('video consultation') || 
                      serviceLower.includes('telehealth');
             });
    }).length;
  }

  /**
   * Calculate comparison statistics with previous period for the vet
   * @param {Array} currentAppointments 
   * @param {Array} prevAppointments 
   * @returns {Object} Comparison stats
   */
  calculateVetComparisonStats(currentAppointments, prevAppointments) {
    const currentTotal = currentAppointments.length;
    const prevTotal = prevAppointments.length;
    
    const currentApproved = currentAppointments.filter(apt => apt.status === 'approved').length;
    const prevApproved = prevAppointments.filter(apt => apt.status === 'approved').length;
    
    const currentCompleted = currentAppointments.filter(apt => apt.status === 'completed').length;
    const prevCompleted = prevAppointments.filter(apt => apt.status === 'completed').length;
    
    // Calculate online and walk-in sessions
    const currentOnline = this.getOnlineSessions(currentAppointments);
    const prevOnline = this.getOnlineSessions(prevAppointments);
    const currentWalkIn = this.getWalkInSessions(currentAppointments);
    const prevWalkIn = this.getWalkInSessions(prevAppointments);
    
    // Calculate percentage changes
    const totalChange = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal * 100).toFixed(1) : '0';
    const approvedChange = prevApproved > 0 ? ((currentApproved - prevApproved) / prevApproved * 100).toFixed(1) : '0';
    const completedChange = prevCompleted > 0 ? ((currentCompleted - prevCompleted) / prevCompleted * 100).toFixed(1) : '0';
    const onlineChange = prevOnline > 0 ? ((currentOnline - prevOnline) / prevOnline * 100).toFixed(1) : '0';
    const walkInChange = prevWalkIn > 0 ? ((currentWalkIn - prevWalkIn) / prevWalkIn * 100).toFixed(1) : '0';
    

    
    return {
      totalAppointments: {
        current: currentTotal,
        previous: prevTotal,
        change: totalChange,
        trend: currentTotal > prevTotal ? 'up' : 'down'
      },
      approvedAppointments: {
        current: currentApproved,
        previous: prevApproved,
        change: approvedChange,
        trend: currentApproved > prevApproved ? 'up' : 'down'
      },
      completedAppointments: {
        current: currentCompleted,
        previous: prevCompleted,
        change: completedChange,
        trend: currentCompleted > prevCompleted ? 'up' : 'down'
      },
      onlineSessions: {
        current: currentOnline,
        previous: prevOnline,
        change: onlineChange,
        trend: currentOnline > prevOnline ? 'up' : 'down'
      },
      walkInSessions: {
        current: currentWalkIn,
        previous: prevWalkIn,
        change: walkInChange,
        trend: currentWalkIn > prevWalkIn ? 'up' : 'down'
      }
    };
  }

  /**
   * Get activity title based on status
   * @param {string} status 
   * @returns {string} Activity title
   */
  getActivityTitle(status) {
    switch (status) {
      case 'approved': return 'Appointment Approved';
      case 'completed': return 'Appointment Completed';
      case 'cancelled': return 'Appointment Cancelled';
      case 'pending': return 'New Appointment';
      default: return 'Appointment Updated';
    }
  }

  /**
   * Get background color for activity
   * @param {string} status 
   * @returns {string} Background color class
   */
  getActivityBgColor(status) {
    switch (status) {
      case 'approved': return 'bg-blue-100';
      case 'completed': return 'bg-green-100';
      case 'cancelled': return 'bg-red-100';
      case 'pending': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  }

  /**
   * Get icon color for activity
   * @param {string} status 
   * @returns {string} Icon color class
   */
  getActivityIconColor(status) {
    switch (status) {
      case 'approved': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      case 'pending': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  }

  /**
   * Get time ago string
   * @param {Date} date 
   * @returns {string} Time ago string
   */
  getTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return format(date, 'MMM dd');
  }
}

export default new VetDashboardStatsService(); 