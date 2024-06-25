import { EmbedBuilder } from 'discord.js';

export const getOneWayPlayerEmbed = (info) => {
  const {
    title,
    artist,
    artwork,
  } = info;

  return new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`Oneway FM is playing: \n\t${title ?? "random stuff"}\n`)
    .setURL("https://www.1wayfm.com.au")
    .setAuthor({ name: artist ?? "Oneway FM" })
    .setImage(artwork ?? "https://www.1wayfm.com.au//wp-content/uploads/2024/01/1WAY-FM-Logo.png")
    .setTimestamp()
}