import { SlashCommandBuilder } from 'discord.js';
import { getAudioPlayerByGuildId } from "../../api/player.js";
import { getEmptyQueueEmbed } from '../../embeds/emptyQueue.js';
export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Skips current music');
export async function execute(interaction) {
  const user = interaction.member;
  const player = getAudioPlayerByGuildId(user.guild.id);
  if (player.queue.length == 0) {
    await interaction.reply({ embeds: [getEmptyQueueEmbed()] });
  } else {
    player.stop();
    await interaction.reply("Skipped current music.");
  }
}