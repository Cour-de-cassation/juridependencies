FROM node:24-alpine
ARG http_proxy
ARG https_proxy

COPY fake-data/ ./

RUN npm ci

RUN npm prune --production
