const { SlashCommandBuilder } = require('discord.js');
const { getAudioPlayerByGuildId } = require("../../api/player");
const { getEmptyQueueEmbed } = require('../../embeds/emptyQueue');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips current music'),
  async execute(interaction) {
    const user = interaction.member;
    const player = getAudioPlayerByGuildId(user.guild.id);
    if (player.queue.length == 0) {
      await interaction.reply({ embeds: [getEmptyQueueEmbed()] });
    } else {
      player.stop();
      await interaction.reply("Skipped current music.");
    }
  },
};