# API URL Fix Summary - 405 Method Not Allowed Error

## Problem Identified
You were getting a **405 Method Not Allowed** error when trying to send SMS OTP because:

1. **Wrong Endpoint**: Frontend was calling `https://innovet-project.vercel.app/api/sms/send-otp`
2. **Endpoint Doesn't Exist**: This endpoint only exists on your **Node.js backend**, not on your **Vercel frontend**
3. **Relative URL Issue**: Services were using relative URLs like `/api/sms` which resolve to the frontend domain

## Root Cause
Your frontend services were using relative API paths that resolve to the wrong domain:

```javascript
// ❌ WRONG - Resolves to Vercel frontend
this.baseURL = '/api/sms'

// ✅ CORRECT - Should resolve to Node.js backend
this.baseURL = `${API_URL}/sms`
```

## Files Fixed

### 1. `frontend/src/services/smsService.js`
- **Before**: `this.baseURL = '/api/sms'`
- **After**: `this.baseURL = \`${API_URL}/sms\``
- **Added**: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'`

### 2. `frontend/src/stores/modules/authStore.js`
- **Before**: `fetch('/api/profile/sync-google-photo')`
- **After**: `fetch(\`${API_URL}/profile/sync-google-photo\`)`
- **Added**: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'`

## How It Works Now

### Environment Variable
```bash
# Set this in your Vercel environment variables
VITE_API_URL=https://innovet-backend-11640508724.asia-southeast1.run.app/api
```

### Service Configuration
```javascript
// All services now use the correct backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// SMS service  
this.baseURL = `${API_URL}/sms`       // → https://innovet-backend-11640508724.asia-southeast1.run.app/api/sms

// Profile endpoints
fetch(`${API_URL}/profile/photo/${uid}`) // → https://innovet-backend-11640508724.asia-southeast1.run.app/api/profile/photo/${uid}
```

## Expected Behavior After Fix

1. **SMS OTP**: Should now call your Node.js backend instead of Vercel frontend  
2. **Profile Sync**: Should now call your Node.js backend instead of Vercel frontend
3. **No More 405 Errors**: All API calls should reach the correct endpoints

## Testing the Fix

### 1. Set Environment Variable in Vercel
```bash
VITE_API_URL=https://innovet-backend-11640508724.asia-southeast1.run.app/api
```

### 2. Deploy Frontend
```bash
cd frontend
vercel --prod
```

### 3. Test SMS OTP
- Try sending an SMS OTP
- Check browser network tab - should call backend URL
- Should no longer get 405 Method Not Allowed

## Benefits of This Fix

1. **Correct Endpoints**: All API calls now reach your Node.js backend
2. **No More 405 Errors**: Proper HTTP method handling
3. **Consistent Configuration**: All services use the same API URL pattern
4. **Environment Flexibility**: Easy to switch between local and production backends
5. **Better Debugging**: Clear separation between frontend and backend calls

## Troubleshooting

If you still get errors after the fix:

1. **Check Environment Variable**: Ensure `VITE_API_URL` is set correctly in Vercel
2. **Check Backend Status**: Verify your Node.js backend is running and accessible
3. **Check Network Tab**: Verify API calls are going to the correct backend URL
4. **Check CORS**: Ensure your backend allows requests from your Vercel domain

## Next Steps

1. **Deploy the updated frontend** to Vercel
2. **Set the environment variable** `VITE_API_URL` in Vercel
3. **Test SMS OTP** functionality
4. **Monitor network requests** to ensure they're going to the backend

