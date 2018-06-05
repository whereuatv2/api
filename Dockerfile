FROM node:latest

MAINTAINER Scott Kraemer

WORKDIR /var/www

RUN npm install -g pm2
RUN npm install

RUN mkdir -p /var/log/pm2

RUN apt-get update

EXPOSE 3000

CMD ["node", "server.js"]
