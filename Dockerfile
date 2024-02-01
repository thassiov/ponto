FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV API_PORT=${API_PORT:-8080}

EXPOSE $API_PORT

CMD ["npm", "run", "start:container"]
