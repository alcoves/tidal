FROM ubuntu:bionic

RUN apt update
RUN apt install -y ffmpeg
RUN apt install -y awscli

COPY ./target/release/tidal /usr/local/bin/tidal

RUN chmod u+x /usr/local/bin/tidal

ENTRYPOINT ["/usr/local/bin/tidal"]