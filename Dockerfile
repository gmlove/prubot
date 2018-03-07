FROM prubot-depcache

RUN mkdir -p /usr/app/

WORKDIR /usr/app/
COPY . /usr/app

EXPOSE 3000

CMD ["node", "prubot/app.js"]
