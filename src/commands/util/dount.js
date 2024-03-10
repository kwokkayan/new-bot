import { SlashCommandBuilder } from 'discord.js';
import { asciiframe } from '../../api/dount.js';

export const data = new SlashCommandBuilder()
  .setName('donut')
  .setDescription('donut.js')
  .addStringOption(opt => opt
    .setName("framerate")
    .setDescription("fps for donut")
    .setRequired(false)
  ).addStringOption(opt => opt
    .setName("duration")
    .setDescription("duration for donut in s")
    .setRequired(false)
  );
export async function execute(interaction) {
  const frametime = 1000 / parseFloat(interaction.options.getString("framerate")) ?? 50;
  const duration = parseFloat(interaction.options.getString("duration")) * 1000 ?? 10000;
  const totalFrames = Math.floor(duration / frametime);
  var frame = 1;
  const getFrameText = () => `\`\`\`\n${asciiframe()}\nframe: ${frame} out of ${totalFrames}\n\`\`\``;
  await interaction.reply(getFrameText());
  const newFrame = async () => {
    frame += 1
    await interaction.editReply(getFrameText());
  }
  const interval = setInterval(newFrame, frametime);
  setTimeout(() => clearInterval(interval), duration);
}