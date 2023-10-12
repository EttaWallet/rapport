ARG NODE_VERSION=18.17.0
ARG NODE_ENV=build
ARG APP_PORT=4545
ARG IMAGE_NAME=rapport-ln

FROM node:${NODE_VERSION}-alpine as builder
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:${NODE_VERSION}-alpine
LABEL name=${IMAGE_NAME}

USER node

WORKDIR /usr/src/app

COPY --from=builder /app/nest-cli.json ./nest-cli.json
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/dist ./dist

# Copy .env file
COPY .env .env

EXPOSE ${APP_PORT}

CMD [ "yarn", "start:prod" ]