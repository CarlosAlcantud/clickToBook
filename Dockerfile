FROM node:18-alpine

# Install Python and build dependencies (needed for bcrypt, etc.)
RUN apk add --no-cache python3 make g++ 

# Set working directory
WORKDIR /app

# Add non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy package files first (leveraging Docker cache)
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY client/package*.json ./client/

# Install backend and frontend dependencies as root
RUN cd backend && npm ci && \
    cd ../client && npm ci && npm run build

# Copy full source after deps (so Docker layer cache isn't busted on each code change)
COPY . .

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set environment variables
ENV NODE_ENV production
ENV PORT 3000

# Expose backend port
EXPOSE 3000

# Start backend app
CMD ["sh", "-c", "cd backend && npm rebuild bcrypt --build-from-source && npm start"]