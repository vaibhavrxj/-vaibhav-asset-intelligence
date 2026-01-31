# Railway Dockerfile for Asset Verifier System
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev --no-cache

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port (Railway sets this via $PORT)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]