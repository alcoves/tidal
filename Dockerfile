FROM node:16-alpine

COPY . .
WORKDIR /app
RUN yarn
RUN yarn build

CMD [ "yarn start" ]