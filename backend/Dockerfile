# Backend Dockerfile - Deao Studios Pitch Generator
FROM node:20-alpine AS base

WORKDIR /app

# Install build dependencies if native addons needed
RUN apk add --no-co-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Create storage directory for exports & uploads
RUN mkdir -p /app/storage/decks /app/storage/uploads && \
    chown -R node:node /app/storage

USER node

EXPOSE 4000

ENV PORT=4000
ENV NODE_ENV=production

CMD ["node", "main.js"]
