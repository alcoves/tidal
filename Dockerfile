FROM node:16-buster

RUN apt update
RUN apt install -y ffmpeg

WORKDIR /app
COPY . .

RUN yarn
RUN yarn build

EXPOSE 3200
CMD yarn start