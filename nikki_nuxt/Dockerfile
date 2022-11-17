FROM node:16-slim

WORKDIR /usr/src/app

COPY . ./
RUN npm install

ARG PROXY_URL
ENV PROXY_URL #{PROXY_URL} 


RUN echo module.exports = {API_URL: '${PROXY_URL}',}; > .env.production.js
RUN cat .env.production.js

EXPOSE 8080

ENV HOST=0.0.0.0
ENV PORT=8080

RUN npm run build

CMD [ "npm", "run", "start" ]