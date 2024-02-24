/* eslint-disable no-undef */
require('dotenv').config();
const log = require('pino')();
const config = {
  token: process.env.DISCORD_API_TOKEN,
  appId: process.env.DISCORD_APP_ID,
  guildId: process.env.DISCORD_GUILD_ID,
}

module.exports = {
  ...config,
  log
}