# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Changed from npm ci to npm install
RUN npm install
COPY . .

# Stage 2: Production execution stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Changed from npm ci to npm install with production flag
RUN npm install --omit=dev
COPY --from=builder /app ./

EXPOSE 8080

CMD ["node", "index.js"]