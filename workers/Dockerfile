FROM node:10.15.3

RUN apt-get update && apt-get upgrade -y
RUN mkdir -p /usr/code

COPY . /usr/code

WORKDIR /usr/code
RUN npm install

CMD [ "npm", "start" ]