# 📱 WhatsApp Integration Setup Guide for ProVet Calapan

## 🎯 Overview
This guide will help you set up WhatsApp notifications for rescheduling appointments in your ProVet Calapan system.

## 📋 Prerequisites
- Node.js backend server running
- WhatsApp installed on your phone
- Phone number with internet connection
- Admin access to your system

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies
```bash
cd node-backend
npm install whatsapp-web.js qrcode-terminal
```

### Step 2: Start Your Backend Server
```bash
cd node-backend
npm start
```

### Step 3: Scan QR Code
1. **Look at your console** - you should see:
   ```
   🔐 WhatsApp QR Code Generated:
   [QR Code appears here]
   📱 Scan this QR code with your WhatsApp to log in
   💡 Make sure to scan with the phone number you want to use for sending messages
   ```

2. **On your phone:**
   - Open WhatsApp
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Scan the QR code from your console

3. **Wait for connection:**
   ```
   ✅ WhatsApp client is ready!
   📱 You can now send WhatsApp notifications
   ```

### Step 4: Test the Integration

#### Option A: Use the Admin Dashboard Component
1. Add the `WhatsAppStatus.vue` component to your admin dashboard
2. Use the test interface to send a test message to your own number

#### Option B: Use API Endpoints Directly
```bash
# Check status
curl http://localhost:3000/api/whatsapp/status

# Send test message
curl -X POST http://localhost:3000/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+639123456789",
    "message": "Test from ProVet Calapan"
  }'
```

### Step 5: Test Reschedule Notifications
1. Go to your vet appointment approval page
2. Try to send a reschedule request for an appointment
3. Check if WhatsApp notification is sent automatically
4. Verify the message appears on your phone

## 🔧 Configuration

### Environment Variables
Create or update your `.env` file in `node-backend`:
```bash
# .env
NODE_ENV=development
PORT=3000

# WhatsApp Configuration
WHATSAPP_BUSINESS_NAME=ProVet Calapan
WHATSAPP_CLINIC_PHONE=+639123456789
WHATSAPP_CLINIC_ADDRESS=Your Clinic Address Here
```

### Phone Number Format
- **Philippines**: +639123456789
- **Other countries**: +[country code][phone number]
- **Remove spaces, dashes, and parentheses**

## 📱 How It Works

### 1. Reschedule Request Flow
1. Vet clicks "Request Reschedule"
2. System saves reschedule request
3. **WhatsApp notification is sent automatically**
4. Client receives formatted message with all details

### 2. Message Content
The WhatsApp message includes:
- Clinic branding (ProVet Calapan)
- Current appointment details
- Reschedule reason
- Suggested new time
- Contact instructions
- Unsubscribe option

### 3. Automatic Integration
- No manual intervention needed
- Works with existing reschedule workflow
- Graceful fallback if WhatsApp fails
- Logs all activities for monitoring

## 🧪 Testing Checklist

- [ ] Backend server starts without errors
- [ ] QR code appears in console
- [ ] QR code scans successfully
- [ ] "WhatsApp client is ready!" message appears
- [ ] Status endpoint returns `{ isReady: true }`
- [ ] Test message sends to your number
- [ ] You receive message on your phone
- [ ] Reschedule notification works from frontend
- [ ] Messages include proper formatting and branding

## 🚨 Troubleshooting

### Common Issues

#### Issue: "WhatsApp client is not ready yet"
**Solution**: Wait for QR code scan and "ready" message

#### Issue: "Failed to send message"
**Solution**: Check phone number format (+63...)

#### Issue: "Client disconnected"
**Solution**: Restart server and scan QR code again

#### Issue: "Puppeteer error"
**Solution**: Ensure you have proper permissions and dependencies

### Debug Commands
```bash
# Check WhatsApp status
curl http://localhost:3000/api/whatsapp/status

# Test simple message
curl -X POST http://localhost:3000/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+639123456789", "message": "Test"}'

# Check server logs
tail -f node-backend/logs/app.log
```

## 🔒 Security & Privacy

### Important Notes
- **Your Messages**: Only you can see messages sent from your account
- **No Data Sharing**: WhatsApp doesn't share your personal data
- **Local Storage**: Authentication data is stored locally on your server
- **Revoke Access**: You can unlink the device anytime from WhatsApp

### Best Practices
1. **Test First**: Always test with your own number
2. **Ask Permission**: Get consent before testing with others
3. **Monitor Usage**: Check logs for any issues
4. **Keep Updated**: Regularly update dependencies

## 📊 Monitoring

### Status Endpoints
- `GET /api/whatsapp/status` - Check connection status
- `POST /api/whatsapp/test` - Send test message
- `POST /api/whatsapp/send-reschedule` - Send reschedule notification

### Log Messages
- 🔐 QR Code generated
- ✅ Client ready
- 📱 Message sent
- ❌ Errors and failures

## 🎉 Success Indicators

When everything is working correctly, you should see:
1. **Green status indicator** in admin dashboard
2. **"Connected" status** with "Ready to send messages"
3. **Successful test messages** to your phone
4. **Automatic notifications** when sending reschedule requests
5. **Proper message formatting** with clinic branding

## 🚀 Next Steps

After successful setup:
1. **Test with real appointments** - Send reschedule requests
2. **Customize messages** - Update clinic contact information
3. **Monitor performance** - Check delivery rates
4. **Scale up** - Consider WhatsApp Business API for production

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review console logs for error messages
3. Verify phone number format and WhatsApp connection
4. Test with simple messages before complex notifications

---

**Happy WhatsApp Integration! 🎯📱**
