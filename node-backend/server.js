//server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mailer = require('./utils/mailer');
const { initScheduler } = require('./scheduler');
const whatsappService = require('./services/whatsappService');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Verify email server connection
mailer.verifyConnection().catch(err => {
  console.warn('Email verification failed, but continuing server startup:', err.message);
});

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Add archive routes
const archiveRoutes = require('./routes/archiveRoutes');
app.use('/api/archives', archiveRoutes);

// Add profile routes
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);

// Add SMS routes
const smsRoutes = require('./routes/smsRoutes');
app.use('/api/sms', smsRoutes);

// WhatsApp Integration Routes
app.get('/api/whatsapp/status', (req, res) => {
  const status = whatsappService.getStatus();
  res.json(status);
});

// Add the missing send-otp route that frontend expects
app.post('/api/whatsapp/send-otp', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        error: 'Phone number and message are required' 
      });
    }
    
    const result = await whatsappService.sendOTP(phoneNumber, message);
    
    res.json({ 
      success: true, 
      messageId: result.id._serialized,
      message: 'WhatsApp OTP sent successfully'
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send WhatsApp OTP',
      details: error.message 
    });
  }
});

app.post('/api/whatsapp/test', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        error: 'Phone number and message are required' 
      });
    }
    
    const result = await whatsappService.sendTestMessage(phoneNumber, message);
    
    res.json({ 
      success: true, 
      messageId: result.id._serialized,
      message: 'Test message sent successfully'
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send test message',
      details: error.message 
    });
  }
});

// Add the send-test route that frontend expects
app.post('/api/whatsapp/send-test', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        error: 'Phone number and message are required' 
      });
    }
    
    const result = await whatsappService.sendTestMessage(phoneNumber, message);
    
    res.json({ 
      success: true, 
      messageId: result.id._serialized,
      message: 'Test message sent successfully'
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send test message',
      details: error.message 
    });
  }
});

app.post('/api/whatsapp/send-reschedule', async (req, res) => {
  try {
    const { phoneNumber, appointment, rescheduleData } = req.body;
    
    if (!phoneNumber || !appointment || !rescheduleData) {
      return res.status(400).json({ 
        error: 'Missing required data: phoneNumber, appointment, or rescheduleData' 
      });
    }
    
    const result = await whatsappService.sendRescheduleNotification(
      phoneNumber,
      appointment,
      rescheduleData
    );
    
    res.json({ 
      success: true, 
      messageId: result.id._serialized,
      message: 'WhatsApp reschedule notification sent successfully'
    });
    
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    res.status(500).json({ 
      error: 'Failed to send WhatsApp notification',
      details: error.message 
    });
  }
});

// Send appointment approval notification
app.post('/api/whatsapp/send-approval', async (req, res) => {
  try {
    const { phoneNumber, appointment } = req.body;
    
    if (!phoneNumber || !appointment) {
      return res.status(400).json({ 
        error: 'Missing required data: phoneNumber or appointment' 
      });
    }
    
    const result = await whatsappService.sendAppointmentApproval(
      phoneNumber,
      appointment
    );
    
    res.json({ 
      success: true, 
      messageId: result.id._serialized,
      message: 'WhatsApp approval notification sent successfully'
    });
    
  } catch (error) {
    console.error('WhatsApp approval notification error:', error);
    res.status(500).json({ 
      error: 'Failed to send WhatsApp approval notification',
      details: error.message 
    });
  }
});

// Send appointment rejection notification
app.post('/api/whatsapp/send-rejection', async (req, res) => {
  try {
    const { phoneNumber, appointment, reason } = req.body;
    
    if (!phoneNumber || !appointment) {
      return res.status(400).json({ 
        error: 'Missing required data: phoneNumber or appointment' 
      });
    }
    
    const result = await whatsappService.sendAppointmentRejection(
      phoneNumber,
      appointment,
      reason
    );
    
    res.json({ 
      success: true, 
      messageId: result.id._serialized,
      message: 'WhatsApp rejection notification sent successfully'
    });
    
  } catch (error) {
    console.error('WhatsApp rejection notification error:', error);
    res.status(500).json({ 
      error: 'Failed to send WhatsApp rejection notification',
      details: error.message 
    });
  }
});

// Send appointment cancellation notification
app.post('/api/whatsapp/send-cancellation', async (req, res) => {
  try {
    const { phoneNumber, appointment, reason } = req.body;
    
    if (!phoneNumber || !appointment) {
      return res.status(400).json({ 
        error: 'Missing required data: phoneNumber or appointment' 
      });
    }
    
    const result = await whatsappService.sendAppointmentCancellation(
      phoneNumber,
      appointment,
      reason
    );
    
    res.json({ 
      success: true, 
      messageId: result.id._serialized,
      message: 'WhatsApp cancellation notification sent successfully'
    });
    
  } catch (error) {
    console.error('WhatsApp cancellation notification error:', error);
    res.status(500).json({ 
      error: 'Failed to send WhatsApp cancellation notification',
      details: error.message 
    });
  }
});

// Send appointment completion notification
app.post('/api/whatsapp/send-completion', async (req, res) => {
  try {
    const { phoneNumber, appointment } = req.body;
    
    if (!phoneNumber || !appointment) {
      return res.status(400).json({ 
        error: 'Missing required data: phoneNumber or appointment' 
      });
    }
    
    const result = await whatsappService.sendAppointmentCompletion(
      phoneNumber,
      appointment
    );
    
    res.json({ 
      success: true, 
      messageId: result.id._serialized,
      message: 'WhatsApp completion notification sent successfully'
    });
    
  } catch (error) {
    console.error('WhatsApp completion notification error:', error);
    res.status(500).json({ 
      error: 'Failed to send WhatsApp completion notification',
      details: error.message 
    });
  }
});

// Initialize the scheduler
initScheduler();
console.log('User archive cleanup scheduler initialized');

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});

module.exports = app;