# Feedback System Documentation

## Overview
The feedback system allows users to provide detailed feedback about their veterinary appointments, including service-specific ratings and overall experience feedback.

## Features

### 1. Service-Specific Ratings
- **Individual service ratings**: Users can rate each service they received (e.g., "Vaccination", "Health Check", "Surgery")
- **5-star rating system**: Each service gets a 1-5 star rating
- **Default ratings**: All services start with 5 stars (excellent) by default

### 2. Overall Experience Rating
- **Overall rating**: General satisfaction with the entire appointment
- **5-star rating system**: 1 = Poor, 5 = Excellent

### 3. Feedback Categories
- **Positive aspects**: What went well during the appointment
- **Areas for improvement**: What could be better
- **Additional comments**: Free-text feedback

### 4. Follow-up Options
- **No follow-up needed**: Standard completion
- **Schedule follow-up**: Request specific timing
- **Contact me**: Ask for discussion

## Firebase Structure

### Collection: `feedback`
```javascript
{
  appointmentId: "string",           // Reference to appointment
  userId: "string",                  // User who provided feedback
  doctorId: "string",                // Doctor being rated
  petName: "string",                 // Pet involved in appointment
  serviceNames: ["string"],          // Array of service names
  overallRating: number,             // 1-5 overall rating
  serviceRatings: {                  // Individual service ratings
    "Service Name": number           // 1-5 rating for each service
  },
  positiveAspects: ["string"],       // What went well
  areasForImprovement: ["string"],   // What could improve
  comments: "string",                // Additional comments
  followUpPreference: "string",      // none/schedule/contact
  followUpTiming: "string",          // Timing preference
  submittedAt: timestamp,            // When feedback was submitted
  status: "string",                  // submitted/processed
  createdAt: timestamp,              // Firebase timestamp
  updatedAt: timestamp               // Firebase timestamp
}
```

## Usage Examples

### 1. Save Feedback
```javascript
import { saveFeedback } from '@/services/feedbackService';

const feedbackData = {
  appointmentId: "appointment123",
  userId: "user456",
  doctorId: "doctor789",
  petName: "Buddy",
  serviceNames: ["Vaccination", "Health Check"],
  overallRating: 5,
  serviceRatings: {
    "Vaccination": 5,
    "Health Check": 4
  },
  positiveAspects: ["professional_staff", "clear_communication"],
  areasForImprovement: ["wait_time"],
  comments: "Great experience overall!",
  followUpPreference: "none"
};

const feedbackId = await saveFeedback(feedbackData);
```

### 2. Get Feedback for Doctor
```javascript
import { getFeedbackByDoctorId } from '@/services/feedbackService';

const doctorFeedback = await getFeedbackByDoctorId("doctor789", 20);
```

### 3. Get Feedback Statistics
```javascript
import { getFeedbackStats } from '@/services/feedbackService';

const stats = await getFeedbackStats("doctor789");
// Returns: { totalFeedbacks, averageRating, ratingDistribution, serviceRatings }
```

## Integration Points

### 1. HistoryPanel.vue
- Shows "Leave Feedback" button for completed appointments
- Opens feedback modal when clicked

### 2. AppointmentFeedback.vue
- Main feedback form component
- Handles form submission and validation
- Saves to Firebase via feedbackService

### 3. feedbackService.js
- Handles all Firebase operations
- Provides CRUD operations for feedback
- Calculates statistics and analytics

## Security Rules (Firebase)

```javascript
// Example Firestore security rules for feedback collection
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /feedback/{feedbackId} {
      // Users can only read/write their own feedback
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == resource.data.doctorId);
      
      // Doctors can read feedback about them
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.doctorId;
    }
  }
}
```

## Future Enhancements

### 1. Analytics Dashboard
- Visual charts for rating distributions
- Service performance comparisons
- Trend analysis over time

### 2. Automated Responses
- Thank you emails for feedback
- Follow-up scheduling automation
- Doctor notification system

### 3. Feedback Templates
- Pre-defined feedback categories
- Quick rating options
- Multi-language support

## Troubleshooting

### Common Issues

1. **Feedback not saving**: Check Firebase permissions and network connection
2. **Service ratings missing**: Ensure all services have ratings before submission
3. **Validation errors**: Check required fields and rating values

### Debug Mode
Enable console logging to see detailed feedback submission process:
```javascript
// In feedbackService.js
console.log('Saving feedback:', feedbackData);
```

## Testing

### Manual Testing
1. Complete an appointment
2. Open feedback modal
3. Rate services and overall experience
4. Submit feedback
5. Verify data in Firebase console

### Automated Testing
```javascript
// Example test for feedback submission
describe('Feedback Submission', () => {
  it('should save feedback to Firebase', async () => {
    const mockFeedback = { /* test data */ };
    const result = await saveFeedback(mockFeedback);
    expect(result).toBeDefined();
  });
});
```


