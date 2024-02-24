const { EmbedBuilder } = require('discord.js');

// inside a command, event listener, etc.
const getPlayerEmbed = (info) => {
  const {
    title,
    author,
    description,
    video_url,
    thumbnails
  } = info;

  const {
    name,
    user_url,
  } = author;

  const authorThumbnail = author.thumbnails;
  
  return new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(title !== null ? title : "❌")
    .setURL(video_url)
    .setAuthor({ name: name, iconURL: thumbnails[0].url, url: user_url })
    .setImage(thumbnails[thumbnails.length - 1].url)
    .setDescription(description !== null ? `${description.substr(0, 50)}...` : "❌")
    .setThumbnail(authorThumbnail[authorThumbnail.length - 1].url)
    .setTimestamp()
}
module.exports = {
  getPlayerEmbed
};