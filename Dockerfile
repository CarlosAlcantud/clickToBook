FROM node:18-alpine

# Install Python and build dependencies
RUN apk add --no-cache python3 make g++ 

# Set up working directory
WORKDIR /app

# Add node user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY client/package*.json ./client/

# Copy source code
COPY . /app/

# Install dependencies and build
RUN --mount=type=cache,id=s/4551adfb-0280-437d-8004-0f3eef25c4b5-node_modules/cache,target=/app/node_modules/.cache \
    cd backend && \
    rm -rf node_modules package-lock.json && \
    npm ci && \
    cd .. && \
    cd client && \
    rm -rf node_modules package-lock.json && \
    npm ci && \
    npm run build && \
    cd ..

# Set user
USER nodejs

# Set environment variables
ENV NODE_ENV production
ENV PORT 3000

# Expose port
EXPOSE 3000

# Start command
CMD ["sh", "-c", "cd backend && npm rebuild bcrypt --build-from-source && npm start"]