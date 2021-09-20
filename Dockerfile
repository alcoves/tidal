FROM ubuntu

RUN apt update
RUN apt install -y curl ffmpeg unzip python3.8
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install -y nodejs
RUN npm i -g yarn

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install

RUN curl "https://www.bok.net/Bento4/binaries/Bento4-SDK-1-6-0-639.x86_64-unknown-linux.zip"  -o "bento4.zip"
RUN unzip bento4.zip
RUN cp -r ./Bento4-SDK-1-6-0-639.x86_64-unknown-linux /usr/local
RUN rm -rf ./Bento4-SDK-1-6-0-639.x86_64-unknown-linux

WORKDIR /app
COPY . .
RUN yarn
RUN yarn build
CMD ["node", "./dist/index.js" ]