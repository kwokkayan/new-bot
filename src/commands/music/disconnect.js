const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { getAudioPlayerByGuildId } = require("../../api/player");
module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('stops music and disconnects'),
  async execute(interaction) {
    try {
      const user = interaction.member;
      const connection = getVoiceConnection(user.guild.id);
      if (connection === undefined) {
        throw new Error("Bot is not connected to vc");
      }
      const player = getAudioPlayerByGuildId(user.guild.id);
      player.queue = [];
      player.stop();
      connection.destroy();
      await interaction.reply(`Music stopped.`);
    } catch (err) {
      await interaction.reply({
        content: `Error: ${err.message}`,
        ephemeral: true
      });
    }
  },
};