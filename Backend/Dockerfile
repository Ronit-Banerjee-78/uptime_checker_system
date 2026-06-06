FROM node:20-alpine

WORKDIR /app

# Explicitly copy package.json since package-lock.json isn't there
COPY package.json ./

# Run a standard npm install omitting development tools
RUN npm install --omit=dev

# Copy the rest of your backend folders (controllers, routes, etc.)
COPY . .

EXPOSE 8080

# Your image points to index.js in the root of Backend folder
CMD ["node", "index.js"]