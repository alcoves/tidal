FROM node:18-alpine3.16
RUN apk add --no-cache ffmpeg wget unzip

RUN wget https://github.com/shaka-project/shaka-packager/releases/download/v2.6.1/packager-linux-x64
RUN mv ./packager-linux-x64 /usr/local/bin/packager
RUN chmod +x /usr/local/bin/packager

WORKDIR /app
COPY src src
COPY package.json yarn.lock tsconfig.json ./

RUN yarn --frozen-lockfile
RUN yarn build
RUN yarn install --production --frozen-lockfile

EXPOSE 5000
CMD yarn start