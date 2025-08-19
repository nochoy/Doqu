# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory for the entire build
WORKDIR /workspaces/doqu/frontend

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Ensure node owns the working directory + future cache dirs
RUN mkdir -p /workspaces/doqu/frontend/.next \
    && mkdir -p /workspaces/doqu/frontend/node_modules \
    && chown -R node:node /workspaces/doqu/frontend

# Switch to the non-root user for security
USER node

# Install dependencies as the node user
RUN npm install

# Expose port 3000
EXPOSE 3000

# Run the app
CMD ["npm", "run", "dev"]
