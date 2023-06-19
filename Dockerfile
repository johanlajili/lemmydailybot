# Use an official Node.js runtime as the base image
FROM node:16.3.0-alpine3.13

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Define the command to run the application
CMD ["npm", "start"]