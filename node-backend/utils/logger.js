// server/utils/logger.js
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Get log level from environment or default to 'info'
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Log levels and their numeric values
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Check if the current log level allows the message to be logged
const shouldLog = (level) => {
  return LOG_LEVELS[level] <= LOG_LEVELS[LOG_LEVEL];
};

// Format the log message
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString}\n`;
};

// Write to console and file
const log = (level, message, meta = {}) => {
  if (!shouldLog(level)) return;

  const formattedMessage = formatLogMessage(level, message, meta);
  
  // Log to console
  const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
  console[consoleMethod](formattedMessage.trim());
  
  // Log to file
  try {
    const logFile = path.join(logsDir, level === 'error' ? 'error.log' : 'combined.log');
    fs.appendFileSync(logFile, formattedMessage);
  } catch (err) {
    console.error(`Failed to write to log file: ${err.message}`);
  }
};

// Logger interface
const logger = {
  error: (message, meta = {}) => log('error', message, meta),
  warn: (message, meta = {}) => log('warn', message, meta),
  info: (message, meta = {}) => log('info', message, meta),
  debug: (message, meta = {}) => log('debug', message, meta)
};

module.exports = logger;