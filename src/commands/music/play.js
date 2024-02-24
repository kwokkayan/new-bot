const { SlashCommandBuilder } = require('discord.js');
const {
  joinVoiceChannel,
  demuxProbe,
  createAudioResource,
} = require('@discordjs/voice');
const { player } = require("../../api/player");
const { createAudioStream, getAudioInfo } = require("../../api/youtube");
const { getPlayerEmbed } = require("../../embeds/player");
const { log } = require("../../config");

async function probeAndCreateResource(readableStream) {
  const { stream, type } = await demuxProbe(readableStream);
  return createAudioResource(stream, { inputType: type });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('plays music')
    .addStringOption(opt =>
      opt
        .setName("url")
        .setDescription("youtube url")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      // Fetch youtube stream and metadata
      const user = interaction.member;
      if (user.voice.channelId === null) {
        throw new Error("User is not connected to voice channel");
      }
      const url = interaction.options.getString("url");
      const audio = await getAudioInfo(url);
      const stream = await createAudioStream(url);
      if (audio === undefined || stream === undefined) {
        throw new Error("Invalid url");
      }
      // Join vc
      const connection = joinVoiceChannel({
        channelId: user.voice.channelId,
        guildId: user.guild.id,
        adapterCreator: user.guild.voiceAdapterCreator
      });
      // Set audio resource
      const resource = await probeAndCreateResource(stream);
      player.play(resource);
      connection.subscribe(player);
      // Send reply
      await interaction.reply({ embeds: [getPlayerEmbed(audio)(0, 1)] });
      stream.on("progress", async (chunkLen, bytesDown, totalBytes) => {
        log.info(chunkLen, bytesDown, totalBytes)
        await interaction.editReply({ embeds: [getPlayerEmbed(audio)(bytesDown, totalBytes)] })
      })
    } catch (err) {
      log.warn(err)
      await interaction.reply({
        content: `Error: ${err.message}`,
        ephemeral: true
      });
    }
  },
};