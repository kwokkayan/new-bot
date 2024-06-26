import { SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import { getStationAudio, getCurrentPlayingInfo } from '../../api/oneway.js';
import { getAudioPlayerByGuildId, probeAndCreateResource } from '../../api/player.js';
import { getOneWayPlayerEmbed } from '../../embeds/onewayPlayer.js';
import { log } from '../../config.js';

const updatePrompt = async (guildId, channel) => {
  const player = getAudioPlayerByGuildId(guildId);
  if (player.queue.length === 0 && player.playingOneway) {
    const current = await getCurrentPlayingInfo();
    channel.send({
      embeds: [getOneWayPlayerEmbed(current)]
    });
    setTimeout(() => updatePrompt(guildId, channel), current.refreshSecs * 1000)
  }
}

export const data = new SlashCommandBuilder()
  .setName('oneway')
  .setDescription('Replies with Pong!');
export async function execute(interaction) {
  try {
    await interaction.deferReply();
    const user = interaction.member;
    const stream = getStationAudio();
    stream.then(async (res) => {
      const resource = await probeAndCreateResource(res.data);
      const guildId = user.guild.id;
      const connection = joinVoiceChannel({
        channelId: user.voice.channelId,
        guildId: guildId,
        adapterCreator: user.guild.voiceAdapterCreator
      })
      const player = getAudioPlayerByGuildId(guildId);
      // clear the queue
      player.queue = [];
      player.playingOneway = true;
      player.play(resource);
      connection.subscribe(player);
      const current = await getCurrentPlayingInfo();
      await interaction.editReply({
        embeds: [getOneWayPlayerEmbed(current)]
      });
      setTimeout(
        () => updatePrompt(guildId, interaction.channel),
        current.refreshSecs * 1000
      );
    });
  } catch (err) {
    log.warn(err);
    await interaction.editReply({
      content: `Error: ${err.message}`,
      ephemeral: true
    });
  }
}