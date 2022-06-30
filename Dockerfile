FROM node:16-alpine
RUN apk add --no-cache ffmpeg curl unzip

RUN curl -O https://downloads.rclone.org/rclone-current-linux-amd64.zip
RUN unzip rclone-current-linux-amd64.zip
RUN cd rclone-*-linux-amd64 && cp rclone /usr/bin/
RUN rm -rf rclone-*-linux-amd64
RUN chown root:root /usr/bin/rclone
RUN chmod 755 /usr/bin/rclone

RUN curl -O https://github.com/shaka-project/shaka-packager/releases/download/v2.6.1/packager-linux-x64
RUN mv ./packager-linux-x64 /usr/local/bin/packager
RUN chown root:root /usr/local/bin/packager
RUN chmod 755 /usr/local/bin/packager
RUN chmod +x /usr/local/bin/packager

WORKDIR /app
COPY src src
COPY package.json yarn.lock tsconfig.json ./

RUN yarn --frozen-lockfile
RUN yarn build
RUN yarn install --production --frozen-lockfile

EXPOSE 5000
CMD yarn start