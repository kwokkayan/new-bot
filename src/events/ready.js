import { Events } from 'discord.js';
import { log } from "../config.js";

export const name = Events.ClientReady;
export const once = true;
export function execute(client) {
  log.info(`Ready! Logged in as ${client.user.tag}`);
}
