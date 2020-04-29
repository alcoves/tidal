FROM alpine:edge

RUN apk add --update --no-cache aws-cli ffmpeg bash

CMD [ "bash" ]
