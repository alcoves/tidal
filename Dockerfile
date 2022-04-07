FROM node:16-alpine
RUN apk add --no-cache ffmpeg

WORKDIR /app
COPY ui ui
COPY api api
COPY package.json yarn.lock tsconfig.json .

RUN yarn --frozen-lockfile
RUN yarn build
RUN yarn install --production --frozen-lockfile

EXPOSE 5000
CMD yarn start