FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy application source code
COPY . .

# Ensure the app folder is writable for standard users to allow the server to create/update 'scores.json'
RUN chown -R node:node /app
USER node

# Expose port for the Express server
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
