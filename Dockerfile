FROM node:16-alpine

RUN apk add ffmpeg

COPY . .
WORKDIR /app
RUN yarn
RUN yarn build

CMD [ "yarn start" ]