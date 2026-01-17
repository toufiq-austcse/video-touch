# STEP 1: Base image for dependencies
FROM node:20-slim as base
WORKDIR /app
COPY package.json .yarnrc ./
# Install production dependencies and prune
RUN yarn --production
RUN apt-get update && apt-get install -y wget && \
    wget -O - https://gobinaries.com/tj/node-prune | sh && \
    node-prune && \
    apt-get remove -y wget && apt-get autoremove -y

# STEP 2: Build stage
FROM base AS dev
COPY nest-cli.json tsconfig.* ./
COPY ./src/ ./src/
RUN yarn
RUN yarn build

# STEP 3: Final Production Image
FROM --platform=linux/amd64 node:18-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    unzip \
    groff \
    less \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 1. Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws

# 2. Install Rclone
RUN curl https://rclone.org/install.sh | bash

# --- ENVIRONMENT CONFIGURATION ---

# AWS Config (Standard)
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_DEFAULT_REGION=us-east-1
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ENV AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION

# Bunny / Rclone Config
# We define a remote named "mybunny" via environment variables
#ARG BUNNY_STORAGE_ZONE
#ARG BUNNY_ACCESS_KEY
#ARG BUNNY_ENDPOINT=storage.bunnycdn.com

# Rclone automatic config via ENVs
#ENV RCLONE_CONFIG_MYBUNNY_TYPE=sftp
#ENV RCLONE_CONFIG_MYBUNNY_HOST=$BUNNY_HOST
#ENV RCLONE_CONFIG_MYBUNNY_PORT=22
#ENV RCLONE_CONFIG_MYBUNNY_USER=alopoth
## We store the pass in a custom ENV to pass it as cleartext in the command
#ENV BUNNY_ACCESS_KEY=$BUNNY_ACCESS_KEY

ENV RCLONE_CONFIG_MYBUNNY_USE_AGENT=false
ENV RCLONE_CONFIG_MYBUNNY_KEY_FILE=none
ENV RCLONE_CONFIG_MYBUNNY_PUBKEY_AUTH=false


# Set up application directory
WORKDIR /app

# Copy built application and dependencies from previous stages
COPY --from=base /app/package.json ./
COPY --from=dev /app/dist/ ./dist/
COPY --from=base /app/node_modules/ ./node_modules/

# Verify tool versions
RUN aws --version && rclone version

EXPOSE 3000
CMD ["node", "dist/main.js"]