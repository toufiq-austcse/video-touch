
FROM node:18 as base

WORKDIR /app
COPY package.json \
    .yarnrc \
  ./

RUN yarn --production
RUN wget -O - https://gobinaries.com/tj/node-prune | sh
RUN node-prune

# lint and formatting configs are commented out
# uncomment if you want to add them into the build process

FROM base AS dev
COPY nest-cli.json \
  tsconfig.* \
#  .eslintrc.js \
#  .prettierrc \
  ./
# bring in src from context
COPY ./src/ ./src/
RUN yarn
# RUN yarn lint
RUN yarn build
# use one of the smallest images possible
FROM --platform=linux/amd64 node:18
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    unzip \
    groff \
    less \
    && rm -rf /var/lib/apt/lists/*
# aws cli
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws \
RUN aws --version

ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_DEFAULT_REGION

# get package.json from base
COPY --from=base /app/package.json ./
# get the dist back
COPY --from=dev /app/dist/ ./dist/
# get the node_modules from the intial cache
COPY --from=base /app/node_modules/ ./node_modules/
# expose application port
EXPOSE 3000
# start
CMD ["node", "dist/main.js"]
