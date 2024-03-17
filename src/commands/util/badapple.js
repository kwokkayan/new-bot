import { SlashCommandBuilder } from 'discord.js';
import { getFrameBuffersFromVideo, getAsciiVideo } from '../../api/badapple.js';
import { log } from '../../config.js';
import {
  setTimeout,
} from 'timers/promises';

export const data = new SlashCommandBuilder()
  .setName('badapple')
  .setDescription('badapple')
  .addStringOption(opt => opt
    .setName("url")
    .setDescription("url for badapple")
    .setRequired(true)
  )
  .addIntegerOption(opt => opt
    .setName("framerate")
    .setDescription("fps for badapple")
    .setRequired(false)
  )
  .addIntegerOption(opt => opt
    .setName("width")
    .setDescription("width for frame (16:9 enforced with height)")
    .setRequired(false)
  )
  .addIntegerOption(opt => opt
    .setName("frametime")
    .setDescription("dt between each frame in ms")
    .setRequired(false)
  ).addBooleanOption(opt => opt
    .setName("video")
    .setDescription("convert to video?")
    .setRequired(false)
  )
export async function execute(interaction) {
  await interaction.deferReply();
  try {
    const url = interaction.options.getString("url");
    const fps = interaction.options.getInteger("framerate") ?? 4;
    const width = interaction.options.getInteger("width") ?? 57;
    const frametime = interaction.options.getInteger("frametime") ?? 1000;
    const video = interaction.options.getBoolean("video") ?? false;
    const height = Math.floor(width * 9 / 16)
    if (!video) { // text display
      if (width * height > 1950) {
        throw new Error("Width too high");
      }
      const frames = await getFrameBuffersFromVideo(url, fps, width, height);
      var i = 0;
      while (i < frames.length) {
        const frameText = `\`\`\`\n${frames[i++]}\nframe: ${i} out of ${frames.length}\n\`\`\``;
        interaction.editReply(frameText);
        setTimeout(frametime);
      }
    } else { //generate video
      const fileName = await getAsciiVideo(url, fps, width, height);
      await interaction.editReply({
        files: [{
          attachment: fileName,
          name: "output.mp4",
          description: "output file"
        }]
      });
    }
  } catch (err) {
    log.warn(err);
    await interaction.editReply({
      content: `Error: ${err.message}`,
      ephemeral: true
    });
  }
}