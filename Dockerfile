# Use Node.js as base image
FROM node:16

# Set working directory
WORKDIR /app

# Install a simple HTTP server
RUN npm install -g http-server

# Copy application files
COPY . .

# Expose port 8080
EXPOSE 8080

# Start the HTTP server
CMD ["http-server", "-p", "8080"] 