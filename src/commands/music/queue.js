const { SlashCommandBuilder } = require('discord.js');
const { getAudioPlayerByGuildId } = require("../../api/player");
const { getQueueListEmbed } = require("../../embeds/queueList");
module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('shows current music queue'),
  async execute(interaction) {
    const user = interaction.member;
    const player = getAudioPlayerByGuildId(user.guild.id);
    await interaction.reply({ embeds: [getQueueListEmbed(player.queue)] });
  },
};