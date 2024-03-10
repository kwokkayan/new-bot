import { log, config } from "./src/config.js";
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import {fileURLToPath} from "url";
import path from "path";
// Require the necessary discord.js classes
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
const { token, appId, guildId } = config
// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});
client.commands = new Collection();
const commands = []

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const foldersPath = join(__dirname, 'src/commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder);
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = join(`file://${commandsPath}`, file);
    const command = await import(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
    } else {
      log.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

// eslint-disable-next-line no-undef
const eventsPath = join(__dirname, 'src/events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = join(`file://${eventsPath}`, file);
  const event = await import(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
const deployCommands = (async () => {
  try {
    log.info(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(appId, guildId),
      { body: commands },
    );

    log.info(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    log.error(error);
  }
});

// Log in to Discord with your client's token
deployCommands();
client.login(token);

import { generateDependencyReport } from '@discordjs/voice';

log.info(generateDependencyReport());
