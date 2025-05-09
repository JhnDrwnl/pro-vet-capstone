// test-server.js
const express = require('express');
const app = express();

// Very simple route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server on a different port
app.listen(3001, () => {
  console.log('Test server running on http://localhost:3001');
});