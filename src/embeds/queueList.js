const { EmbedBuilder } = require('discord.js');
const { getEmptyQueueEmbed } = require('./emptyQueue');
const getQueueListEmbed = (queue) => {
  if (queue.length == 0) {
    return getEmptyQueueEmbed();
  }

  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`Queue`)
    .setTimestamp()

  let num = 0;
  queue.forEach(({ audio }) => {
    const {
      title,
      author,
    } = audio;
    const {
      name,
    } = author;
    embed.addFields({ name: `${num == 0 ? "Current: " : `${num}: `}${title}`, value: `${name}` })
    num++;
  });

  return embed;
}

module.exports = {
  getQueueListEmbed
};