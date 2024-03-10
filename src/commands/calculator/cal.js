import { SlashCommandBuilder } from 'discord.js';
import { interpret } from '../../api/interpreter.js';

export const data = new SlashCommandBuilder()
  .setName('cal')
  .setDescription('Calculator')
  .addStringOption(opt => opt
    .setName("expression")
    .setDescription("arithmetic expression")
    .setRequired(true)
  );
export async function execute(interaction) {
  const out = interpret(interaction.options.getString("expression"));
  await interaction.reply(`${out}`);
}