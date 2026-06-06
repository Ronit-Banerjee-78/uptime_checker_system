# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: Production execution stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Only install production dependencies to keep the image lightweight
RUN npm ci --only=production
COPY --from=builder /app ./

# Expose the internal port (Render maps traffic here via process.env.PORT)
EXPOSE 8080

CMD ["node", "index.js"]