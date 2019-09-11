FROM node:lts

RUN apt-get update && apt-get install supervisor -y
RUN adduser runner --gecos "" --disabled-password
RUN mkdir -p /usr/code
RUN chown -R runner:runner /usr/code

COPY . /usr/code
COPY ./deploy/config /usr/code

WORKDIR /usr/code
RUN su runner -c "npm install"

EXPOSE 3000

CMD /usr/bin/supervisord -c /usr/code/supervisord.conf
