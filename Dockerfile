FROM node:20.11.1 AS dep
RUN apt update
RUN apt install libsodium-dev libsodium23 ffmpeg -y

FROM dep
WORKDIR /usr/app
COPY . ./new-bot
WORKDIR /usr/app/new-bot
RUN mv package-prod.json package.json
RUN npm install -g pino-pretty
RUN npm install --omit=dev
CMD npm run dev