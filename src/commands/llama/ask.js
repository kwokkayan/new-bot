import { SlashCommandBuilder } from 'discord.js';
import { log } from "../../config.js";
import { session } from "../../api/llama.js";

export const data = new SlashCommandBuilder()
  .setName('ask')
  .setDescription('ask the bot anything')
  .addStringOption(opt => opt
    .setName("message")
    .setDescription("anything you want")
    .setRequired(true)
  );
export async function execute(interaction) {
  const message = interaction.options.getString("message");
  await interaction.reply({ content: `Answering...`, ephermal: true });
  log.info(`prompted AI with: ${message}`);
  const answer = await session.prompt(message);
  await interaction.editReply(answer);
  log.info(`AI responded to: ${message}`);
}