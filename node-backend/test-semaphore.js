// node-backend/test-semaphore.js
require('dotenv').config();
const smsService = require('./services/smsService');

async function testSemaphore() {
  console.log('🧪 Testing Semaphore SMS Integration...\n');
  
  try {
    // Test 1: Check service status
    console.log('1️⃣ Checking SMS service status...');
    const status = await smsService.getStatus();
    console.log('Status:', status);
    
    // Test 2: Check balance
    console.log('\n2️⃣ Checking SMS balance...');
    const balance = await smsService.getBalance();
    console.log('Balance:', balance);
    
    // Test 3: Send test message (uncomment to test)
    /*
    console.log('\n3️⃣ Sending test message...');
    const testPhone = '639123456789'; // Replace with your test phone number
    const testMessage = '🧪 This is a test message from InnoVet SMS service!';
    const testResult = await smsService.sendTestMessage(testPhone, testMessage);
    console.log('Test message result:', testResult);
    */
    
    console.log('\n✅ Semaphore SMS integration test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('API key not configured')) {
      console.log('\n💡 Make sure you have set SEMAPHORE_API_KEY in your .env file');
    } else if (error.message.includes('insufficient')) {
      console.log('\n💡 Your Semaphore account has insufficient credits');
    }
  }
}

// Run the test
testSemaphore();
