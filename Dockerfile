FROM node:20.11.1 AS dep
RUN apt update
RUN apt install libsodium-dev libsodium23 ffmpeg antlr4 -y

FROM dep
WORKDIR /usr/app
COPY . ./new-bot
WORKDIR /usr/app/new-bot
RUN npm install --omit=dev
RUN npm run gen-parser
CMD npm run prod