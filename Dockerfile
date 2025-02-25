# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json ./

# Install dependencies
RUN npm install --only=production

# Copy the application source code
COPY . .

# Expose the necessary port
EXPOSE 3000

# Define the command to run the application
CMD ["node", "src/app.js"]
