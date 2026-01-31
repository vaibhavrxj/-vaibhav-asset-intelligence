# Railway Dockerfile for Asset Verifier System
FROM node:22-alpine

WORKDIR /app

# Install dependencies (including dev dependencies for build)
COPY package*.json ./
RUN npm ci --no-cache

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm ci --omit=dev --no-cache

# Expose port (Railway sets this via $PORT)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]