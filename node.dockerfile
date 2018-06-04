FROM node:latest

MAINTAINER Scott Kraemer

WORKDIR /var/www

RUN npm install -g pm2
RUN npm install

RUN mkdir -p /var/log/pm2

RUN apt-get update

EXPOSE 3000
EXPOSE 7000

#"--node-args=\"--debug=0.0.0.0:7000\"",
#ENTRYPOINT ["pm2", "start", "server.js", "--log", "/var/log/pm2/pm2.log", "--watch", "--no-daemon", "--node-args='--debug=0.0.0.0:7000'"]
CMD ["node", "--inspect=0.0.0.0:7000","server.js"]
