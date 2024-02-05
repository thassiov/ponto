FROM node:lts-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm run bundle

FROM node:lts-alpine as run

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/index.js /usr/src/app/index.js
COPY --from=build /usr/src/app/api.yaml /usr/src/app/api.yaml

RUN npm i sqlite3 swagger-ui-express

ENV API_PORT=${API_PORT:-8080}

EXPOSE $API_PORT

CMD ["node", "./index.js"]
