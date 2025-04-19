import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"

// Get Firestore instance
const db = getFirestore();

class TelehealthService {
  constructor() {
    // Check if db is properly initialized
    if (!db) {
      console.error("Firestore db is not initialized!")
    }
    console.log("TelehealthService initialized with db:", !!db)
  }

  // Helper method to format user ID with prefix and first 5 chars
  formatUserId(fullUid) {
    if (!fullUid) return null;
    
    // If already in the correct format (starts with user_ prefix), return as is
    if (fullUid.startsWith('user_')) {
      return fullUid;
    }
    
    // Extract first 5 characters of the UID and add prefix
    return `user_${fullUid.substring(0, 8)}`;
  }

  // Get user appointments
  async getUserAppointments(userId, role) {
    try {
      // Format the userId with the prefix pattern
      const formattedUserId = this.formatUserId(userId);
      console.log(`Getting appointments for ${role} with ID: ${formattedUserId}`)

      // Create mock data for testing when db is not available
      if (!db) {
        console.warn("Using mock data since Firestore is not initialized");
        return this.getMockAppointments();
      }

      const appointmentsRef = collection(db, "appointments")
      let appointmentsQuery

      if (role === "doctor" || role === "veterinary") {
        appointmentsQuery = query(appointmentsRef, where("doctorId", "==", formattedUserId))
      } else {
        appointmentsQuery = query(appointmentsRef, where("userId", "==", formattedUserId))
      }

      const appointmentsSnapshot = await getDocs(appointmentsQuery)
      const appointments = []

      appointmentsSnapshot.forEach((doc) => {
        const data = doc.data()
        appointments.push({
          id: doc.id,
          ...data,
          title: data.serviceNames ? data.serviceNames[0] : "Telehealth Session",
          doctorName: data.doctorName || "Veterinarian",
          patientName: data.patientName || "Patient", // Add patient name
          petName: data.petName || "Your Pet",
          petType: data.petType || "Pet",
          scheduledTime: data.date ? new Date(data.date) : new Date(),
          status: data.status || "pending",
          notes: data.notes || "",
        })
      })

      console.log(`Found ${appointments.length} appointments for ${role}`)
      return appointments
    } catch (error) {
      console.error("Error getting user appointments:", error)
      // Return mock data as fallback
      return this.getMockAppointments();
    }
  }

  // Get approved appointments
  async getApprovedAppointments(userId, role) {
    try {
      // Format the userId with the prefix pattern
      const formattedUserId = this.formatUserId(userId);
      console.log(`Getting approved appointments for ${role} with ID: ${formattedUserId}`)

      // Get all appointments first
      const appointments = await this.getUserAppointments(formattedUserId, role)

      // Filter for approved appointments
      const approvedAppointments = appointments.filter((appointment) => appointment.status === "approved")

      console.log(`Found ${approvedAppointments.length} approved appointments for ${role}`)
      return approvedAppointments
    } catch (error) {
      console.error("Error getting approved appointments:", error)
      // Return mock approved appointments as fallback
      return this.getMockAppointments().filter(app => app.status === "approved");
    }
  }

  // Get pending appointments (for vet approval)
  async getPendingAppointments(doctorId) {
    try {
      // Format the doctorId with the prefix pattern
      const formattedDoctorId = this.formatUserId(doctorId);
      console.log(`Getting pending appointments for doctor with ID: ${formattedDoctorId}`)

      // Get all appointments first
      const appointments = await this.getUserAppointments(formattedDoctorId, "doctor")

      // Filter for pending appointments
      const pendingAppointments = appointments.filter((appointment) => appointment.status === "pending")

      console.log(`Found ${pendingAppointments.length} pending appointments for approval`)
      return pendingAppointments
    } catch (error) {
      console.error("Error getting pending appointments:", error)
      return this.getMockAppointments().filter(app => app.status === "pending");
    }
  }

  // Get appointment by ID
  async getAppointment(appointmentId) {
    try {
      // Verify db is available
      if (!db) {
        console.warn("Using mock data since Firestore is not initialized");
        const mockAppointments = this.getMockAppointments();
        const appointment = mockAppointments.find(app => app.id === appointmentId);
        if (!appointment) {
          throw new Error("Appointment not found");
        }
        return appointment;
      }

      const appointmentDoc = await getDoc(doc(db, "appointments", appointmentId))
      if (!appointmentDoc.exists()) {
        throw new Error("Appointment not found")
      }

      const data = appointmentDoc.data()
      return {
        id: appointmentDoc.id,
        ...data,
        title: data.serviceNames ? data.serviceNames[0] : "Telehealth Session",
        doctorName: data.doctorName || "Veterinarian",
        patientName: data.patientName || "Patient", // Add patient name
        petName: data.petName || "Your Pet",
        petType: data.petType || "Pet",
        scheduledTime: data.date ? new Date(data.date) : new Date(),
        status: data.status || "pending",
        notes: data.notes || "",
      }
    } catch (error) {
      console.error("Error getting appointment:", error)
      throw error
    }
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId, status) {
    try {
      // Verify db is available
      if (!db) {
        console.warn("Mock update since Firestore is not initialized");
        return true;
      }

      await updateDoc(doc(db, "appointments", appointmentId), {
        status: status,
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (error) {
      console.error("Error updating appointment status:", error)
      throw error
    }
  }

  // Approve an appointment
  async approveAppointment(appointmentId) {
    return this.updateAppointmentStatus(appointmentId, "approved")
  }

  // Reject an appointment
  async rejectAppointment(appointmentId) {
    return this.updateAppointmentStatus(appointmentId, "rejected")
  }

  // Save appointment notes
  async saveAppointmentNotes(appointmentId, notes) {
    try {
      // Verify db is available
      if (!db) {
        console.warn("Mock save notes since Firestore is not initialized");
        return true;
      }

      await updateDoc(doc(db, "appointments", appointmentId), {
        notes: notes,
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (error) {
      console.error("Error saving appointment notes:", error)
      throw error
    }
  }

  // For backward compatibility - these methods use the same functions but with different names
  async getUserSessions(userId, role) {
    return this.getUserAppointments(userId, role)
  }

  async getApprovedSessions(userId, role) {
    return this.getApprovedAppointments(userId, role)
  }

  async getSession(sessionId) {
    return this.getAppointment(sessionId)
  }

  async updateSessionStatus(sessionId, status) {
    return this.updateAppointmentStatus(sessionId, status)
  }

  async approveSession(sessionId) {
    return this.approveAppointment(sessionId)
  }

  async saveSessionNotes(sessionId, notes) {
    return this.saveAppointmentNotes(sessionId, notes)
  }

  // Mock data for testing when Firestore is not available
  getMockAppointments() {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    return [
      {
        id: "mock-appointment-1",
        title: "Regular Checkup",
        doctorId: "user_test-",
        doctorName: "Dr. Smith",
        userId: "user_test-",
        patientName: "John Doe",
        petName: "Max",
        petType: "Dog",
        scheduledTime: tomorrow,
        status: "approved",
        notes: "Annual wellness exam",
      },
      {
        id: "mock-appointment-2",
        title: "Vaccination",
        doctorId: "user_test-",
        doctorName: "Dr. Smith",
        userId: "user_test-",
        patientName: "Jane Smith",
        petName: "Whiskers",
        petType: "Cat",
        scheduledTime: now,
        status: "approved",
        notes: "Rabies vaccination due",
      },
      {
        id: "mock-appointment-3",
        title: "Follow-up Visit",
        doctorId: "user_test-",
        doctorName: "Dr. Smith",
        userId: "user_test-",
        patientName: "Robert Johnson",
        petName: "Buddy",
        petType: "Dog",
        scheduledTime: yesterday,
        status: "completed",
        notes: "Post-surgery follow-up",
      },
      {
        id: "mock-appointment-4",
        title: "Skin Condition",
        doctorId: "user_test-",
        doctorName: "Dr. Smith",
        userId: "user_test-",
        patientName: "Sarah Williams",
        petName: "Luna",
        petType: "Cat",
        scheduledTime: tomorrow,
        status: "pending",
        notes: "Examining rash on belly",
      }
    ];
  }
}

// Create a singleton instance
const telehealthService = new TelehealthService()
export default telehealthService