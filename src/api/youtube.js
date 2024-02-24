const { ytBufferSize } = require('../config');
const ytdl = require('@distube/ytdl-core');

const createAudioStream = async (url) => {
  if (!ytdl.validateURL(url)) return undefined;

  let info = await ytdl.getInfo(url);
  let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
  let format = ytdl.chooseFormat(audioFormats, {
    quality: "highestaudio",
    filter: f => f.container === "webm",
  });
  return ytdl(url, {
    format,
    highWaterMark: ytBufferSize
  });
}

const getAudioInfo = async (url) => {
  if (!ytdl.validateURL(url)) return undefined;
  let info = await ytdl.getInfo(url);
  return {
    ...info.videoDetails
  }
}

module.exports = {
  createAudioStream,
  getAudioInfo
}