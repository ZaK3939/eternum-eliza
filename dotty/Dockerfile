# Use an official Node.js runtime as the base image
FROM node:23.3.0-slim

# Install necessary dependencies
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    gcc \
    g++ \
    make \
    pkg-config \
    libtool \
    autoconf \
    automake \
    libc6 \
    libc6-dev \
    curl \
    tar \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /app

# First, copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./ 

# Copy the entire project
COPY . .

# Install dependencies without frozen lockfile
RUN pnpm install

# Move to eliza directory
WORKDIR /app/dotty

# Expose port 3000
EXPOSE 3000

# Start command
CMD ["pnpm", "start","--non-interactive","--character='characters/dotty.character.json'"]