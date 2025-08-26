# 📧 Email Architecture Documentation

## 🎯 **Overview**

This document explains how email services work in the InnoVet system. **Email verification and OTP services are NOT handled by the Node.js backend** - they are handled by **Firebase Cloud Functions**.

## 🏗️ **System Architecture**

```
┌─────────────────┐    ┌─────────────────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Firebase Cloud Functions  │    │   Email Service │
│                 │    │                             │    │                 │
│ emailService.js │───▶│  sendEmail function        │───▶│  Firebase/SMTP  │
│                 │    │  (us-central1-...)         │    │                 │
└─────────────────┘    └─────────────────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────────────────┐
│   Frontend      │    │   Firebase Auth             │
│                 │    │                             │
│ Settings.vue    │───▶│  sendEmailVerification()   │
│ Profile.vue     │    │  (Built-in Firebase)       │
└─────────────────┘    └─────────────────────────────┘
```

## 📧 **Email Services**

### **1. OTP & Verification Emails**
- **Service:** Firebase Cloud Function
- **URL:** `https://us-central1-provet-calapan-3bc89.cloudfunctions.net/sendEmail`
- **Handles:** 
  - User registration OTPs
  - Password reset OTPs
  - Email verification codes
- **Frontend:** `src/services/emailService.js`

### **2. Firebase Auth Emails**
- **Service:** Firebase Authentication (built-in)
- **Handles:** 
  - Account email verification
  - Password reset emails
- **Frontend:** `Settings.vue`, `Profile.vue`

## 🔧 **Configuration**

### **Frontend Environment Variables**
```bash
# Firebase Cloud Function for emails
VITE_FIREBASE_EMAIL_FUNCTION_URL=https://us-central1-provet-calapan-3bc89.cloudfunctions.net/sendEmail
```

### **Backend Environment Variables**
```bash
# NOT needed for email services
# Emails are handled by Firebase Cloud Functions
# Only Firebase Admin SDK credentials are required for database access
```

## 🚀 **How It Works**

### **OTP Flow:**
1. **Frontend** calls `emailService.sendOTP()`
2. **emailService** sends HTTP POST to Firebase Cloud Function
3. **Cloud Function** generates OTP and sends email
4. **User** receives email with verification code
5. **Frontend** calls `emailService.verifyOTP()` to verify

### **Firebase Auth Flow:**
1. **Frontend** calls `sendEmailVerification()`
2. **Firebase Auth** sends verification email
3. **User** clicks link to verify email
4. **Firebase** updates user's `emailVerified` status

## ⚠️ **Important Notes**

1. **Node.js backend is NOT involved** in email sending
2. **All OTP emails** come from Firebase Cloud Functions
3. **Firebase Auth emails** come from Firebase's built-in service
4. **Backend only handles** database operations and user management
5. **Email configuration** is NOT needed in backend `.env`

## 🔍 **Troubleshooting**

### **If emails are not working:**
1. Check Firebase Cloud Function status
2. Verify Cloud Function URL in `emailService.js`
3. Check Firebase project configuration
4. Ensure Cloud Function has proper permissions

### **If OTP verification fails:**
1. Check Cloud Function logs
2. Verify OTP storage in Cloud Function
3. Check frontend API calls to Cloud Function

## 📝 **Files Involved**

- **Frontend Email Service:** `src/services/emailService.js`
- **Auth Store:** `src/stores/modules/authStore.js`
- **Settings Components:** `Settings.vue`, `Profile.vue`
- **Firebase Cloud Function:** `us-central1-provet-calapan-3bc89.cloudfunctions.net/sendEmail`

## 🎉 **Summary**

**Email services in InnoVet are fully handled by Firebase Cloud Functions, not the Node.js backend. The backend only manages user data and authentication state.**





