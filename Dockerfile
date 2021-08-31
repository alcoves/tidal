FROM node:16 AS build

WORKDIR /srv
COPY package.json yarn.lock tsconfig.json /srv/
RUN yarn install --frozen-lockfile
COPY src /srv/src/
RUN yarn build
RUN yarn install --frozen-lockfile --production

FROM node:16
RUN apt update && apt install -y ffmpeg
WORKDIR /srv
COPY --from=build /srv/node_modules /srv/node_modules
COPY --from=build /srv/dist /srv/
EXPOSE 4000
CMD ["node", "/srv/index.js", "api", "--port", "4000" ]