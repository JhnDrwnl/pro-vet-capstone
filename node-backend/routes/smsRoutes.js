// node-backend/routes/smsRoutes.js
const express = require('express');
const router = express.Router();
const smsService = require('../services/smsService');

// Send SMS OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber, message, otp } = req.body;
    
    if (!phoneNumber || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and OTP are required' 
      });
    }
    
    const result = await smsService.sendOTP(phoneNumber, otp);
    
    res.json({ 
      success: true, 
      messageId: result.messageId,
      status: result.status,
      message: 'SMS OTP sent successfully'
    });
    
  } catch (error) {
    console.error('SMS send-otp error:', error);
    
    // Handle specific Semaphore errors
    if (error.message.includes('insufficient') || error.message.includes('balance')) {
      return res.status(402).json({ 
        success: false, 
        message: 'SMS service temporarily unavailable due to insufficient credits',
        error: error.message
      });
    } else if (error.message.includes('invalid') || error.message.includes('number')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number format',
        error: error.message
      });
    } else if (error.message.includes('rate limit')) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many SMS requests. Please wait before trying again.',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send SMS OTP',
      error: error.message 
    });
  }
});

// Send test SMS message
router.post('/send-test', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and message are required' 
      });
    }
    
    const result = await smsService.sendTestMessage(phoneNumber, message);
    
    res.json({ 
      success: true, 
      messageId: result.messageId,
      status: result.status,
      message: 'Test SMS sent successfully'
    });
    
  } catch (error) {
    console.error('SMS send-test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test SMS',
      error: error.message 
    });
  }
});

// Send appointment reminder SMS
router.post('/send-appointment-reminder', async (req, res) => {
  try {
    const { phoneNumber, message, type } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and message are required' 
      });
    }
    
    // Use the existing sendTestMessage function for appointment reminders
    const result = await smsService.sendTestMessage(phoneNumber, message);
    
    res.json({ 
      success: true, 
      messageId: result.messageId,
      status: result.status,
      message: 'Appointment reminder SMS sent successfully'
    });
    
  } catch (error) {
    console.error('SMS send-appointment-reminder error:', error);
    
    // Handle specific Semaphore errors
    if (error.message.includes('insufficient') || error.message.includes('balance')) {
      return res.status(402).json({ 
        success: false, 
        message: 'SMS service temporarily unavailable due to insufficient credits',
        error: error.message
      });
    } else if (error.message.includes('invalid') || error.message.includes('number')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number format',
        error: error.message
      });
    } else if (error.message.includes('rate limit')) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many SMS requests. Please wait before trying again.',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send appointment reminder SMS',
      error: error.message 
    });
  }
});

// Send appointment confirmation SMS
router.post('/send-appointment-confirmation', async (req, res) => {
  try {
    const { phoneNumber, message, type } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and message are required' 
      });
    }
    
    // Use the existing sendTestMessage function for appointment confirmations
    const result = await smsService.sendTestMessage(phoneNumber, message);
    
    res.json({ 
      success: true, 
      messageId: result.messageId,
      status: result.status,
      message: 'Appointment confirmation SMS sent successfully'
    });
    
  } catch (error) {
    console.error('SMS send-appointment-confirmation error:', error);
    
    // Handle specific Semaphore errors
    if (error.message.includes('insufficient') || error.message.includes('balance')) {
      return res.status(402).json({ 
        success: false, 
        message: 'SMS service temporarily unavailable due to insufficient credits',
        error: error.message
      });
    } else if (error.message.includes('invalid') || error.message.includes('number')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number format',
        error: error.message
      });
    } else if (error.message.includes('rate limit')) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many SMS requests. Please wait before trying again.',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send appointment confirmation SMS',
      error: error.message 
    });
  }
});

// Send appointment approval SMS
router.post('/send-appointment-approval', async (req, res) => {
  try {
    const { phoneNumber, message, type } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and message are required' 
      });
    }
    
    // Use the existing sendTestMessage function for appointment approvals
    const result = await smsService.sendTestMessage(phoneNumber, message);
    
    res.json({ 
      success: true, 
      messageId: result.messageId,
      status: result.status,
      message: 'Appointment approval SMS sent successfully'
    });
    
  } catch (error) {
    console.error('SMS send-appointment-approval error:', error);
    
    // Handle specific Semaphore errors
    if (error.message.includes('insufficient') || error.message.includes('balance')) {
      return res.status(402).json({ 
        success: false, 
        message: 'SMS service temporarily unavailable due to insufficient credits',
        error: error.message
      });
    } else if (error.message.includes('invalid') || error.message.includes('number')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number format',
        error: error.message
      });
    } else if (error.message.includes('rate limit')) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many SMS requests. Please wait before trying again.',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send appointment approval SMS',
      error: error.message 
    });
  }
});

// Send appointment rejection SMS
router.post('/send-appointment-rejection', async (req, res) => {
  try {
    const { phoneNumber, message, type } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and message are required' 
      });
    }
    
    // Use the existing sendTestMessage function for appointment rejections
    const result = await smsService.sendTestMessage(phoneNumber, message);
    
    res.json({ 
      success: true, 
      messageId: result.messageId,
      status: result.status,
      message: 'Appointment rejection SMS sent successfully'
    });
    
  } catch (error) {
    console.error('SMS send-appointment-rejection error:', error);
    
    // Handle specific Semaphore errors
    if (error.message.includes('insufficient') || error.message.includes('balance')) {
      return res.status(402).json({ 
        success: false, 
        message: 'SMS service temporarily unavailable due to insufficient credits',
        error: error.message
      });
    } else if (error.message.includes('invalid') || error.message.includes('number')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number format',
        error: error.message
      });
    } else if (error.message.includes('rate limit')) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many SMS requests. Please wait before trying again.',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send appointment rejection SMS',
      error: error.message 
    });
  }
});

// Get SMS balance
router.get('/balance', async (req, res) => {
  try {
    const result = await smsService.getBalance();
    res.json(result);
  } catch (error) {
    console.error('SMS balance check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get SMS balance',
      error: error.message 
    });
  }
});

// Get SMS service status
router.get('/status', async (req, res) => {
  try {
    const result = await smsService.getStatus();
    res.json(result);
  } catch (error) {
    console.error('SMS status check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check SMS service status',
      error: error.message 
    });
  }
});

// Get message status
router.get('/message/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    if (!messageId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message ID is required' 
      });
    }
    
    const result = await smsService.getMessageStatus(messageId);
    res.json(result);
  } catch (error) {
    console.error('SMS message status check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get message status',
      error: error.message 
    });
  }
});

module.exports = router;


