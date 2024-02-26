const { EmbedBuilder } = require('discord.js');

const getEmptyQueueEmbed = () => {
  return new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`Empty Queue`)
    .setTimestamp()
}

module.exports = {
  getEmptyQueueEmbed
};