import ytdl from '@distube/ytdl-core';
const { validateURL, getInfo, filterFormats, chooseFormat } = ytdl;

export const createAudioStream = async (url) => {
  if (!validateURL(url)) return undefined;

  let info = await getInfo(url);
  let audioFormats = filterFormats(info.formats, 'audioonly');
  let format = chooseFormat(audioFormats, {
    quality: "highestaudio",
    filter: f => f.container === "webm",
  });
  return ytdl(url, {
    format,
    highWaterMark: 1 << 62,
  });
}

export const createVideoStream = async (url) => {
  if (!validateURL(url)) return undefined;
  let info = await getInfo(url);
  let audioFormats = filterFormats(info.formats, 'videoonly');
  let format = chooseFormat(audioFormats, {
    quality: "lowestvideo",
    filter: f => f.container === "mp4",
  });
  return ytdl(url, {
    format,
    highWaterMark: 1 << 62,
  });
}

export const getAudioInfo = async (url) => {
  if (!validateURL(url)) return undefined;
  let info = await getInfo(url);
  return {
    ...info.videoDetails
  }
}