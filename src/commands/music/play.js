import { SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannel, demuxProbe, createAudioResource } from '@discordjs/voice';
import { getAudioPlayerByGuildId } from "../../api/player.js";
import { createAudioStream, getAudioInfo } from "../../api/youtube.js";
import { getPlayerEmbed } from "../../embeds/player.js";
import { getQueueCardEmbed } from "../../embeds/queueCard.js";
import { log } from "../../config.js";

async function probeAndCreateResource(readableStream) {
  const { stream, type } = await demuxProbe(readableStream);
  return createAudioResource(stream, { inputType: type });
}

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
    const player = getAudioPlayerByGuildId(user.guild.id);
    // store audio info, stream resource, and text channel for output
    player.queue.push({ audio, resource, channel: interaction.channel });
    let embed = undefined;
    if (player.queue.length == 1) {
      player.play(resource);
      connection.subscribe(player);
      embed = { embeds: [getPlayerEmbed(audio)] };
    } else {
      embed = { embeds: [getQueueCardEmbed(audio)] };
    }
    // send reply
    await interaction.reply(embed);
  } catch (err) {
    log.warn(err);
    await interaction.reply({
      content: `Error: ${err.message}`,
      ephemeral: true
    });
  }
}