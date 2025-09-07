FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port (Cloud Run will override this)
EXPOSE 8080

# Health check (Cloud Run compatible)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Start the application with Cloud Run PORT
CMD ["sh", "-c", "PORT=${PORT:-3000} npm start"]
