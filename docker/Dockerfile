FROM node:22-slim AS build-step

COPY ./ /app/
WORKDIR /app
RUN npm install && npm run build

FROM nginx:mainline-alpine3.21-slim

COPY --from=build-step /app/out /usr/share/nginx/html
COPY ./docker/nginx.default.conf /etc/nginx/conf.d/default.conf
