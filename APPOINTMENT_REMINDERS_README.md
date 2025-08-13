# Appointment Reminder System

## Overview
This system automatically sends appointment reminders to users at 6:00 AM daily for any appointments they have scheduled that day.

## How It Works

### 1. Automatic Daily Reminders
- **Time**: Every day at exactly 6:00 AM
- **Process**: 
  - System checks all approved appointments for the current day
  - Creates notification records in the `notifications` collection
  - Each user with an appointment receives a reminder notification

### 2. Components

#### `AppointmentReminder.vue`
- **Location**: `frontend/src/components/common/AppointmentReminder.vue`
- **Purpose**: Background component that runs globally
- **Function**: 
  - Checks every minute if it's 6:00 AM
  - Automatically triggers `sendDailyAppointmentReminders()`
  - No visible UI (hidden component)

#### `notificationService.js`
- **Location**: `frontend/src/services/notificationService.js`
- **Functions**:
  - `sendDailyAppointmentReminders()`: Main function that sends reminders
  - `createAppointmentReminder()`: Creates individual reminder notifications
  - `getTodaysAppointments()`: Fetches today's appointments for a user

#### `ReminderTester.vue`
- **Location**: `frontend/src/components/common/ReminderTester.vue`
- **Purpose**: Testing component for development
- **Features**:
  - Manual trigger button for testing reminders
  - Shows current time and countdown to next 6 AM check
  - Blue bell icon (🔔) in bottom-right corner

### 3. Notification Structure
Each reminder notification contains:
```javascript
{
  type: 'appointment_reminder',
  priority: 'medium',
  userId: 'user_id_here',
  title: 'Appointment Reminder',
  message: 'Don\'t forget your appointment today at [TIME] for [PET_NAMES]',
  appointmentId: 'appointment_id',
  petNames: ['Pet1', 'Pet2'],
  serviceNames: ['Service1', 'Service2'],
  appointmentTime: '2:00 PM',
  appointmentDate: '2024-01-15',
  createdAt: '2024-01-15T06:00:00.000Z',
  read: false
}
```

### 4. Integration Points

#### App.vue
- Both `AppointmentReminder` and `ReminderTester` components are imported
- Runs globally for all authenticated users

#### Notification Panel
- Reminders appear in the existing notification system
- Users can view, mark as read, and interact with reminders
- Real-time updates via Firestore listeners

### 5. Testing the System

#### Manual Testing
1. Click the blue bell icon (🔔) in the bottom-right corner
2. Click "Send Test Reminders" to manually trigger the system
3. Check the console for logs and results

#### Console Logs
The system provides detailed logging:
- `📅 Appointment reminder system initialized`
- `🕕 6:00 AM - Sending daily appointment reminders...`
- `✅ Successfully sent X appointment reminders`

### 6. Firestore Collections Used

#### `notifications`
- Stores all notification records
- Includes appointment reminders, confirmations, etc.

#### `appointments`
- Source of appointment data for reminders
- Only approved appointments trigger reminders

### 7. Timing and Scheduling

#### Daily Check
- **Frequency**: Every minute
- **Trigger Time**: Exactly 6:00 AM
- **Window**: 1-minute precision

#### Performance Considerations
- Checks every minute but only processes at 6 AM
- Efficient Firestore queries with proper indexing
- Batch processing for multiple users

### 8. User Experience

#### For Users
- Automatic reminders at 6 AM daily
- Clear notification messages with appointment details
- Integration with existing notification panel
- No action required from users

#### For Developers
- Easy to test with ReminderTester component
- Comprehensive logging for debugging
- Modular service architecture
- Configurable timing and messaging

### 9. Future Enhancements

#### Potential Improvements
- Customizable reminder times per user
- Multiple reminder intervals (e.g., 6 AM, 2 PM)
- SMS/email integration
- Appointment-specific reminder messages
- Timezone support for different regions

#### Configuration Options
- Reminder time (currently hardcoded to 6 AM)
- Message templates
- Notification priorities
- User preferences for reminder frequency

## Troubleshooting

### Common Issues
1. **Reminders not sending**: Check console logs for initialization messages
2. **Wrong time**: Verify system clock and timezone settings
3. **No notifications**: Ensure user has approved appointments for the day
4. **Firestore errors**: Check collection permissions and indexes

### Debug Steps
1. Open browser console and look for reminder system logs
2. Use ReminderTester component to manually trigger reminders
3. Verify appointments exist in Firestore with correct status
4. Check notification collection for created reminders

## Security Notes
- Only authenticated users receive reminders
- Reminders only sent for approved appointments
- User data is properly isolated by userId
- No sensitive information exposed in notifications


