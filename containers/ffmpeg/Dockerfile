FROM ubuntu:22.04

RUN apt update && DEBIAN_FRONTEND=noninteractive apt install -y wget xz-utils awscli

RUN wget https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n6.0-latest-linux64-gpl-6.0.tar.xz
RUN tar xvf ffmpeg-n6.0-latest-linux64-gpl-6.0.tar.xz
RUN cp ffmpeg-n6.0-latest-linux64-gpl-6.0/bin/* /usr/local/bin/
RUN rm -rf ffmpeg-n6.0-latest-linux64-gpl-6.0
RUN rm ffmpeg-n6.0-latest-linux64-gpl-6.0.tar.xz

COPY function.sh /var/task/function.sh

CMD /var/task/function.sh
