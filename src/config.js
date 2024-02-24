/* eslint-disable no-undef */
require('dotenv').config();
const log = require('pino')();
const config = {
  token: process.env.DISCORD_API_TOKEN,
  appId: process.env.DISCORD_APP_ID,
  guildId: process.env.DISCORD_GUILD_ID,
  ytBufferSize: typeof process.env.YT_BUFFER_SIZE === 'number' ? process.env.YT_BUFFER_SIZE : 4096 * 1024
}

module.exports = {
  ...config,
  log
}