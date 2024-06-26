import { SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import { getAudioPlayerByGuildId, probeAndCreateResource } from "../../api/player.js";
import { createAudioStream, getAudioInfo, scrapePlaylist } from "../../api/youtube.js";
import { getPlayerEmbed } from "../../embeds/player.js";
import { getQueueCardEmbed } from "../../embeds/queueCard.js";
import { log } from '../../config.js';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('plays music')
  .addStringOption(opt => opt
    .setName("url")
    .setDescription("youtube url")
    .setRequired(true)
  );
export async function execute(interaction) {
  try {
    await interaction.deferReply();
    // Fetch youtube stream and metadata
    const user = interaction.member;
    if (user.voice.channelId === null) {
      throw new Error("User is not connected to voice channel");
    }
    const ytUrl = interaction.options.getString("url");
    // process playlist...
    const playlist = await scrapePlaylist(ytUrl);
    const player = getAudioPlayerByGuildId(user.guild.id);
    const emptyQueue = player.queue.length == 0
    let audioCards = [];
    for (const url of playlist) {
      const audio = await getAudioInfo(url);
      const stream = await createAudioStream(url);
      if (audio === undefined || stream === undefined) {
        throw new Error("Invalid url");
      }
      audioCards.push(audio);
      // Set audio resource
      const resource = await probeAndCreateResource(stream);
      // store audio info, stream resource, and text channel for output
      player.queue.push({ audio, resource, channel: interaction.channel });
    }
    let embed = undefined;
    if (emptyQueue) {
      const {audio, resource} = player.queue[0];
      // Join vc
      const connection = joinVoiceChannel({
        channelId: user.voice.channelId,
        guildId: user.guild.id,
        adapterCreator: user.guild.voiceAdapterCreator
      });
      player.play(resource);
      connection.subscribe(player);
      embed = { embeds: [getPlayerEmbed(audio)] };
    } else {
      const embeds = audioCards.slice(0, 10).map((audio) => getQueueCardEmbed(audio))
      embed = { embeds };
    }
    player.playingOneway = false;
    // send reply
    await interaction.editReply(embed);
  } catch (err) {
    log.warn(err);
    await interaction.editReply({
      content: `Error: ${err.message}`,
      ephemeral: true
    });
  }
}