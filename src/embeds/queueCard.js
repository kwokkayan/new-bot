import { EmbedBuilder } from 'discord.js';

export const getQueueCardEmbed = (info) => {
  const {
    title,
    author,
    video_url,
  } = info;

  const {
    name,
    user_url,
  } = author;

  const authorThumbnail = author.thumbnails;

  return new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`Added ${title !== null ? title : "❌"} to queue`)
    .setURL(video_url)
    .setAuthor({ name: name, iconURL: authorThumbnail[0].url, url: user_url })
    .setTimestamp()
}