import { SlashCommandBuilder } from 'discord.js';
import { getFrameBuffersFromVideo } from '../../api/badapple.js';
import { log } from '../../config.js';
export const data = new SlashCommandBuilder()
  .setName('badapple')
  .setDescription('badapple')
  .addStringOption(opt => opt
    .setName("url")
    .setDescription("url for badapple")
    .setRequired(true)
  )
  .addStringOption(opt => opt
    .setName("framerate")
    .setDescription("fps for badapple")
    .setRequired(false)
  )
  .addStringOption(opt => opt
    .setName("width")
    .setDescription("width for frame (16:9 enforced with height)")
    .setRequired(false)
  )
  .addStringOption(opt => opt
    .setName("frametime")
    .setDescription("dt between each frame in ms")
    .setRequired(false)
  )
export async function execute(interaction) {
  await interaction.deferReply();
  try {
    var fps = interaction.options.getString("framerate") ?? 4;
    var width = interaction.options.getString("width") ?? 57;
    var frametime = interaction.options.getString("frametime") ?? 1000;
    fps = parseInt(fps);
    width = parseInt(width);
    frametime = parseInt(frametime);
    const height = Math.floor(width * 9 / 16)
    if (width * height > 1950) {
      throw new Error("Width too high");
    }
    const url = interaction.options.getString("url");
    const frames = await getFrameBuffersFromVideo(url, fps, width, height);
    var i = 0;
    var interval = setInterval(async () => {
      const frameText = `\`\`\`\n${frames[i++]}\nframe: ${i} out of ${frames.length}\n\`\`\``;
      await interaction.editReply(frameText);
      if (i >= frames.length) clearInterval(interval);
    }, frametime);
  } catch (err) {
    log.warn(err);
    await interaction.editReply({
      content: `Error: ${err.message}`,
      ephemeral: true
    });
  }
}