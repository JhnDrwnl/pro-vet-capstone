import { db, rtdb } from '../firebase-config'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { 
  ref as dbRef, 
  set, 
  push, 
  update, 
  onValue, 
  off, 
  onDisconnect, 
  remove,
  get
} from 'firebase/database'

class TelehealthService {
  constructor() {
    this.listeners = {};
  }
  
  // Create a new session
  async createSession(sessionData) {
    try {
      // Add scheduled time as Timestamp
      const data = {
        ...sessionData,
        scheduledTime: Timestamp.fromDate(new Date(sessionData.scheduledTime)),
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'sessions'), data);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }
  
  // Get session by ID
  async getSession(sessionId) {
    try {
      const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
      if (!sessionDoc.exists()) {
        throw new Error('Session not found');
      }
      
      return {
        id: sessionDoc.id,
        ...sessionDoc.data(),
        scheduledTime: sessionDoc.data().scheduledTime?.toDate() || sessionDoc.data().scheduledTime
      };
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }
  
  // Get user sessions
  async getUserSessions(userId, role) {
    try {
      const sessionsRef = collection(db, 'sessions');
      let sessionsQuery;
      
      if (role === 'doctor') {
        sessionsQuery = query(sessionsRef, where('doctorId', '==', userId));
      } else {
        sessionsQuery = query(sessionsRef, where('patientId', '==', userId));
      }
      
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = [];
      
      sessionsSnapshot.forEach((doc) => {
        sessions.push({
          id: doc.id,
          ...doc.data(),
          scheduledTime: doc.data().scheduledTime?.toDate() || doc.data().scheduledTime
        });
      });
      
      return sessions;
    } catch (error) {
      console.error('Error getting user sessions:', error);
      throw error;
    }
  }
  
  // Update session status
  async updateSessionStatus(sessionId, status) {
    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
        status: status,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  }
  
  // Save session notes
  async saveSessionNotes(sessionId, notes) {
    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
        notes: notes,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error saving session notes:', error);
      throw error;
    }
  }
  
  // Listen for incoming calls
  listenForIncomingCalls(userId, callback) {
    const userCallsRef = dbRef(rtdb, `users/${userId}/calls`);
    
    onValue(userCallsRef, (snapshot) => {
      const calls = snapshot.val();
      if (calls) {
        // Filter for incoming calls
        const incomingCalls = Object.entries(calls)
          .filter(([_, call]) => call.status === 'incoming')
          .map(([id, call]) => ({ id, ...call }));
        
        if (incomingCalls.length > 0) {
          callback(incomingCalls[0]);
        }
      }
    });
    
    // Return a function to remove the listener
    return () => off(userCallsRef);
  }
  
  // Update call status
  async updateCallStatus(callId, userId, status) {
    try {
      const userCallRef = dbRef(rtdb, `users/${userId}/calls/${callId}`);
      await update(userCallRef, { status });
      
      return true;
    } catch (error) {
      console.error('Error updating call status:', error);
      throw error;
    }
  }
  
  // Get user by ID
  async getUser(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }
  
  // Register event listener
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  // Emit event
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

export default new TelehealthService();