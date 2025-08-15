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
