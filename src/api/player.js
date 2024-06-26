import { createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus, demuxProbe, createAudioResource } from '@discordjs/voice';
import { Collection } from 'discord.js';
import { getPlayerEmbed } from "../embeds/player.js";
import { log } from '../config.js';
const players = new Collection();

export const getAudioPlayerByGuildId = (id) => {
  let player = players.get(id);
  if (player !== undefined) {
    return player;
  }
  player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  player.queue = [];

  player.on('stateChange', (oldState, newState) => {
    log.info(`Audio player for ${id} transitioned from ${oldState.status} to ${newState.status}`);
  });

  player.on(AudioPlayerStatus.Idle, () => {
    // pop current music from queue
    if (player.queue.length > 0) {
      player.queue.shift();
    }
    // play new music and show info
    if (player.queue.length > 0) {
      const { audio, resource, channel } = player.queue[0];
      player.play(resource);
      channel.send({ content: "New music from queue:", embeds: [getPlayerEmbed(audio)] });
    }
  });

  players.set(id, player);
  return player
}

export async function probeAndCreateResource(readableStream) {
  const { stream, type } = await demuxProbe(readableStream);
  return createAudioResource(stream, { inputType: type });
}