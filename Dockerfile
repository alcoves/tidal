FROM node:16-alpine

COPY app .
RUN yarn
RUN yarn build

CMD ["yarn", "start"]