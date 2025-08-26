# Email Service Setup Guide for InnoVet Backend

This guide will help you set up the email service for OTP verification and other email functionality.

## 🚀 Quick Setup Options

### Option 1: Gmail (Easiest for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Add to your `.env` file**:
   ```bash
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_APP_PASSWORD=your-16-digit-app-password
   EMAIL_FROM=noreply@innovet.com
   ```

### Option 2: SendGrid (Recommended for Production)

1. **Sign up for SendGrid** (free tier: 100 emails/day)
2. **Create an API Key**:
   - Dashboard → Settings → API Keys
   - Create API Key → Full Access or Restricted Access (Mail Send)
3. **Add to your `.env` file**:
   ```bash
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=your-sendgrid-api-key
   EMAIL_FROM=noreply@innovet.com
   ```

### Option 3: Custom SMTP

1. **Get SMTP credentials** from your email provider
2. **Add to your `.env` file**:
   ```bash
   EMAIL_SERVICE=smtp
   SMTP_HOST=smtp.your-provider.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-username
   SMTP_PASS=your-password
   EMAIL_FROM=noreply@innovet.com
   ```

## 📧 Environment Variables

Copy these to your `.env` file:

```bash
# Email Service Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@innovet.com

# Alternative: SendGrid
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=your-sendgrid-api-key

# Alternative: Custom SMTP
# EMAIL_SERVICE=smtp
# SMTP_HOST=smtp.your-provider.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-username
# SMTP_PASS=your-password
```

## 🧪 Testing the Email Service

1. **Start your backend server**
2. **Test the connection**:
   ```bash
   # The server will automatically test email connection on startup
   # Check the console logs for connection status
   ```

3. **Test OTP sending**:
   ```bash
   curl -X POST http://localhost:8080/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","firstName":"Test"}'
   ```

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use App Passwords** for Gmail (not regular passwords)
3. **Restrict API keys** to minimum required permissions
4. **Use environment variables** in production deployments
5. **Monitor email sending** for abuse detection

## 📱 Email Templates

The system includes beautiful HTML email templates for:
- **Email Verification OTP** - Blue theme
- **Password Reset OTP** - Red theme
- **Custom emails** - Generic template

## 🚨 Troubleshooting

### Common Issues:

1. **"Authentication failed"**:
   - Check your email/password
   - For Gmail: Use App Password, not regular password
   - Enable 2FA if using Gmail

2. **"Connection timeout"**:
   - Check your internet connection
   - Verify SMTP host/port
   - Check firewall settings

3. **"Rate limit exceeded"**:
   - Gmail: 500 emails/day limit
   - SendGrid: Check your plan limits
   - Implement rate limiting in your app

### Debug Mode:

Enable debug logging by setting:
```bash
LOG_LEVEL=debug
```

## 🌐 Production Deployment

For production, consider:

1. **SendGrid** - Professional email delivery
2. **AWS SES** - Cost-effective for high volume
3. **Mailgun** - Developer-friendly
4. **Postmark** - Transactional email specialist

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your email service credentials
3. Test with a simple email client first
4. Check your email provider's documentation

---

**Note**: This email service replaces the previous Firebase Cloud Functions implementation and provides better control over email delivery and templates.
