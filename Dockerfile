FROM node:16-alpine
WORKDIR /app

COPY . .

RUN yarn
RUN yarn build

EXPOSE 5000
CMD yarn start