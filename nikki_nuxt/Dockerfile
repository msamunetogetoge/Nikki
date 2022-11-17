FROM node:16-slim

WORKDIR /usr/src/app

COPY . ./

ARG PROXY_URL
ENV PROXY_URL #{PROXY_URL} 

RUN touch './.env.production.js'
RUN echo 'module.exports = {API_URL: ''${PROXY_URL}'',};' > './.env.production.js'
RUN cat ./.env.production.js

RUN npm install



EXPOSE 8080

ENV HOST=0.0.0.0
ENV PORT=8080

RUN npm run build

CMD [ "npm", "run", "start" ]