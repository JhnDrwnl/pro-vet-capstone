# Xirsys Setup for Telehealth Integration

## Overview
This guide explains how to set up Xirsys TURN/STUN servers for the telehealth video calling feature in the vet queue system.

## What is Xirsys?
Xirsys provides TURN and STUN servers that help WebRTC connections work through firewalls and NAT devices, ensuring reliable video calls for telehealth appointments.

## Setup Steps

### 1. Get Xirsys Account
1. Go to [https://xirsys.com/](https://xirsys.com/)
2. Sign up for an account
3. Choose a plan (they have free tiers available)
4. Get your credentials from the dashboard

### 2. Environment Variables
Create a `.env` file in your `frontend` directory with:

```bash
# Xirsys Configuration
VITE_XIRSYS_URL=https://global.xirsys.net
VITE_XIRSYS_PATH=/_turn/
VITE_XIRSYS_IDENT=your_xirsys_identifier_here
VITE_XIRSYS_SECRET=your_xirsys_secret_key_here
```

### 3. How It Works
1. **Queue Detection**: When a vet clicks "Start" on a telehealth appointment
2. **Xirsys Initialization**: The system automatically fetches ICE servers from Xirsys
3. **ICE Server Setup**: TURN/STUN servers are configured for WebRTC
4. **Video Call Launch**: Redirects to telehealth interface with proper configuration

### 4. Status Indicators
- 🟢 **Green**: Full TURN server support (optimal)
- 🟡 **Yellow**: STUN servers only (limited connectivity)
- 🔴 **Red**: No servers available (check configuration)

### 5. Testing
1. Set up your `.env` file with Xirsys credentials
2. Restart your development server
3. Check the queue interface for "Telehealth Ready" status
4. Try starting a telehealth consultation

## Troubleshooting

### "Telehealth Unavailable" Error
- Check if `.env` file exists in `frontend` directory
- Verify Xirsys credentials are correct
- Check browser console for error messages
- Ensure Xirsys account is active

### "Xirsys STUN Only" Status
- This means only STUN servers are available
- Video calls may work but with limited connectivity
- Consider upgrading Xirsys plan for TURN servers

### Environment Variables Not Loading
- Make sure `.env` file is in the `frontend` directory
- Restart your development server after adding `.env`
- Check that variable names start with `VITE_`

## Security Notes
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Xirsys credentials are only used client-side for WebRTC setup
- No sensitive data is stored in the application

## Support
If you continue having issues:
1. Check the browser console for detailed error messages
2. Verify your Xirsys account status
3. Test with a simple WebRTC application first
4. Contact Xirsys support for account issues
