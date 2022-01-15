FROM node:16-alpine
RUN apk add ffmpeg

WORKDIR /app
COPY . .
RUN yarn
RUN yarn build

EXPOSE 5000
CMD yarn start