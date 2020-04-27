FROM ubuntu:bionic

RUN apt update
RUN apt install -y ffmpeg
RUN apt install -y awscli

COPY ./target/release/tidal /usr/local/bin/tidal

CMD [ "bash", "tidal --help" ]
