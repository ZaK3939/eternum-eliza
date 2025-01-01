FROM node:23.3.0-slim

RUN apt-get update && apt-get install -y \
    git python3 gcc g++ make pkg-config libtool \
    autoconf automake libc6 libc6-dev curl tar \
    libpixman-1-dev libcairo2-dev libpango1.0-dev \
    build-essential

# Install pnpm globally - moved before WORKDIR
RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

COPY . .

RUN pnpm install

WORKDIR /app

EXPOSE 3000

CMD ["pnpm", "start", "--non-interactive"]