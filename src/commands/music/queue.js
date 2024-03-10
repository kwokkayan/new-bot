import { SlashCommandBuilder } from 'discord.js';
import { getAudioPlayerByGuildId } from "../../api/player.js";
import { getQueueListEmbed } from "../../embeds/queueList.js";
export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('shows current music queue');
export async function execute(interaction) {
  const user = interaction.member;
  const player = getAudioPlayerByGuildId(user.guild.id);
  await interaction.reply({ embeds: [getQueueListEmbed(player.queue)] });
}