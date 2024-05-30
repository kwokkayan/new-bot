/* eslint-disable no-undef */
import 'dotenv/config'
import { pino } from "pino"
export const log = pino();
export const config = {
  token: process.env.DISCORD_API_TOKEN,
  appId: process.env.DISCORD_APP_ID,
  guildId: process.env.DISCORD_GUILD_ID,
  googleAPIKey: process.env.GOOGLE_API_KEY,
}
