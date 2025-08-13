// services/feedbackService.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@shared/firebase';

/**
 * Save appointment feedback to Firebase
 * @param {Object} feedbackData - The feedback data to save
 * @returns {Promise<string>} - Document ID of the saved feedback
 */
export const saveFeedback = async (feedbackData) => {
  try {
    // Validate required fields
    const requiredFields = ['appointmentId', 'userId', 'doctorId', 'petName', 'overallRating'];
    const missingFields = requiredFields.filter(field => !feedbackData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Ensure petName is not undefined or null
    if (!feedbackData.petName || feedbackData.petName === 'undefined' || feedbackData.petName === 'null') {
      throw new Error('Pet name is required and cannot be undefined or null');
    }
    
    const feedbackWithTimestamp = {
      ...feedbackData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const feedbackRef = collection(db, 'feedback');
    const docRef = await addDoc(feedbackRef, feedbackWithTimestamp);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving feedback to Firebase:', error);
    throw error;
  }
};

/**
 * Get feedback for a specific appointment
 * @param {string} appointmentId - The appointment ID
 * @returns {Promise<Object|null>} - The feedback data or null if not found
 */
export const getFeedbackByAppointmentId = async (appointmentId) => {
  try {
    const feedbackRef = collection(db, 'feedback');
    const q = query(
      feedbackRef, 
      where('appointmentId', '==', appointmentId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting feedback by appointment ID:', error);
    throw error;
  }
};

/**
 * Get all feedback for a specific doctor
 * SECURITY: This function only returns feedback where doctorId matches the provided ID
 * @param {string} doctorId - The doctor's ID (must match the authenticated user's ID)
 * @param {number} limit - Maximum number of feedback to return
 * @returns {Promise<Array>} - Array of feedback data filtered by doctorId
 */
export const getFeedbackByDoctorId = async (doctorId, limitCount = 50) => {
  try {
    // Security: Validate doctorId parameter
    if (!doctorId || typeof doctorId !== 'string') {
      throw new Error('Invalid doctor ID provided')
    }
    
    const feedbackRef = collection(db, 'feedback');
    const q = query(
      feedbackRef, 
      where('doctorId', '==', doctorId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting feedback by doctor ID:', error);
    throw error;
  }
};

/**
 * Get all feedback for a specific user
 * @param {string} userId - The user's ID
 * @param {number} limit - Maximum number of feedback to return
 * @returns {Promise<Array>} - Array of feedback data
 */
export const getFeedbackByUserId = async (userId, limitCount = 50) => {
  try {
    const feedbackRef = collection(db, 'feedback');
    const q = query(
      feedbackRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting feedback by user ID:', error);
    throw error;
  }
};

/**
 * Update existing feedback
 * @param {string} feedbackId - The feedback document ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<void>}
 */
export const updateFeedback = async (feedbackId, updateData) => {
  try {
    const feedbackRef = doc(db, 'feedback', feedbackId);
    await updateDoc(feedbackRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    console.log('Feedback updated successfully');
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
};

/**
 * Delete feedback
 * @param {string} feedbackId - The feedback document ID
 * @returns {Promise<void>}
 */
export const deleteFeedback = async (feedbackId) => {
  try {
    const feedbackRef = doc(db, 'feedback', feedbackId);
    await deleteDoc(feedbackRef);
    
    console.log('Feedback deleted successfully');
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};

/**
 * Get feedback statistics for a doctor
 * SECURITY: This function only returns statistics for feedback where doctorId matches the provided ID
 * @param {string} doctorId - The doctor's ID (must match the authenticated user's ID)
 * @returns {Promise<Object>} - Statistics object filtered by doctorId
 */
export const getFeedbackStats = async (doctorId) => {
  try {
    // Security: Validate doctorId parameter
    if (!doctorId || typeof doctorId !== 'string') {
      throw new Error('Invalid doctor ID provided')
    }
    
    const feedbackRef = collection(db, 'feedback');
    const q = query(
      feedbackRef, 
      where('doctorId', '==', doctorId)
    );
    
    const querySnapshot = await getDocs(q);
    
    const feedbacks = querySnapshot.docs.map(doc => doc.data());
    
    if (feedbacks.length === 0) {
      return {
        totalFeedbacks: 0,
        averageRating: 0,
        ratingDistribution: {},
        serviceRatings: {}
      };
    }
    
    // Calculate overall rating statistics
    const totalRating = feedbacks.reduce((sum, feedback) => sum + (feedback.overallRating || 0), 0);
    const averageRating = totalRating / feedbacks.length;
    
    // Calculate rating distribution
    const ratingDistribution = {};
    feedbacks.forEach(feedback => {
      const rating = feedback.overallRating || 0;
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });
    
    // Calculate service-specific ratings
    const serviceRatings = {};
    feedbacks.forEach(feedback => {
      if (feedback.serviceRatings) {
        Object.entries(feedback.serviceRatings).forEach(([service, rating]) => {
          if (!serviceRatings[service]) {
            serviceRatings[service] = { total: 0, count: 0 };
          }
          serviceRatings[service].total += rating;
          serviceRatings[service].count += 1;
        });
      }
    });
    
    // Calculate averages for services
    Object.keys(serviceRatings).forEach(service => {
      serviceRatings[service].average = serviceRatings[service].total / serviceRatings[service].count;
    });
    
    return {
      totalFeedbacks: feedbacks.length,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      serviceRatings
    };
  } catch (error) {
    console.error('Error getting feedback statistics:', error);
    throw error;
  }
};
