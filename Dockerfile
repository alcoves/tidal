FROM node:16-alpine
RUN apk add ffmpeg wget unzip bash python3

RUN wget https://www.bok.net/Bento4/binaries/Bento4-SDK-1-6-0-639.x86_64-unknown-linux.zip
RUN unzip Bento4-SDK-1-6-0-639.x86_64-unknown-linux.zip
RUN cp Bento4-SDK-1-6-0-639.x86_64-unknown-linux/* /usr/local/ -r

WORKDIR /app
COPY . .
RUN yarn
RUN yarn build

EXPOSE 5000
CMD yarn start