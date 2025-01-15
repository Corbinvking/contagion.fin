# Use Node.js LTS
FROM node:18-alpine AS builder

# Install additional dependencies needed for map rendering
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ARG MAPBOX_TOKEN
ENV MAPBOX_TOKEN=$MAPBOX_TOKEN

# Copy package files first
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm install

# Debug: List contents before copy
RUN ls -la

# Copy the rest of the application
COPY . .

# Debug: List contents after copy
RUN echo "Contents of /app:"
RUN ls -la
RUN echo "Contents of /app/src:"
RUN ls -la src/
RUN echo "Contents of /app/src/components:"
RUN ls -la src/components/ || echo "components directory not found"

# Build the app with optimization flags
RUN npm run build

# Start a new stage for production
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/server.js ./src/server.js

# Expose port
EXPOSE 8080

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Use node directly instead of npm for better container signals handling
CMD ["node", "src/server.js"] 