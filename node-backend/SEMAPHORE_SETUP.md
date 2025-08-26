# Semaphore SMS Integration Setup Guide

## 1. Environment Variables

Add these variables to your `.env` file:

```bash
# Semaphore SMS Configuration
SEMAPHORE_API_KEY=your_semaphore_api_key_here
SEMAPHORE_SENDER_NAME=InnoVet
```

## 2. Getting Your Semaphore API Key

1. Go to [Semaphore.co](https://semaphore.co)
2. Sign up for an account
3. Navigate to API section
4. Generate your API key
5. Copy the API key to your `.env` file

## 3. Sender Name Configuration

- `SEMAPHORE_SENDER_NAME` should be your registered sender name
- Default is set to "InnoVet"
- Make sure your sender name is approved by Semaphore

## 4. Testing the Integration

You can test the SMS service using these endpoints:

```bash
# Check SMS service status
GET /api/sms/status

# Check SMS balance
GET /api/sms/balance

# Send test SMS
POST /api/sms/send-test
{
  "phoneNumber": "+639123456789",
  "message": "Test message from InnoVet"
}

# Send OTP SMS
POST /api/sms/send-otp
{
  "phoneNumber": "+639123456789",
  "otp": "123456"
}
```

## 5. Phone Number Format

The service automatically formats Philippine phone numbers:
- Input: `09123456789` or `+639123456789`
- Output: `639123456789` (Semaphore format)

## 6. Error Handling

The service handles common Semaphore errors:
- Insufficient credits (402 status)
- Invalid phone number (400 status)
- Rate limiting (429 status)
- API errors (500 status)

## 7. Message Templates

OTP messages include:
- 6-digit verification code
- 5-minute validity period
- Security warning
- Unsubscribe option

## 8. Monitoring

Monitor your SMS delivery through:
- Semaphore dashboard
- API response status
- Message ID tracking
- Balance monitoring


