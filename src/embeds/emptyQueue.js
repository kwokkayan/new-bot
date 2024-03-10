import { EmbedBuilder } from 'discord.js';

export const getEmptyQueueEmbed = () => {
  return new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`Empty Queue`)
    .setTimestamp()
}