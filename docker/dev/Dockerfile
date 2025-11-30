# Base image with Node.js
FROM node:20-bookworm

# Install basic tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    sqlite3 \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install Deno
ENV DENO_INSTALL=/usr/local
RUN curl -fsSL https://deno.land/x/install/install.sh | sh
ENV PATH=${DENO_INSTALL}/bin:${PATH}

# Verify installations
RUN node --version
RUN npm --version
RUN deno --version

# Set working directory
WORKDIR /app

# Default command
CMD ["sleep", "infinity"]
