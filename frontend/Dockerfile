# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code, including next.config.mjs
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"]



# # This dockerfile is for prodcution
# # Use an official Node runtime as the parent image
# FROM node:18-alpine

# # Set the working directory in the container
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm ci

# # Copy the rest of the application code
# COPY . .

# # Build the Next.js application
# RUN npm run build

# # Expose the port the app runs on
# EXPOSE 3000

# # Create a script to update environment variables at runtime and start the app
# RUN echo "#!/bin/sh" > /app/start.sh && \
#     echo "echo \"NEXT_PUBLIC_API_URL=\$API_URL\" > /app/.env.local" >> /app/start.sh && \
#     echo "npm start" >> /app/start.sh && \
#     chmod +x /app/start.sh

# # Start the application
# CMD ["/app/start.sh"]
