import ytdl from '@distube/ytdl-core';
import { google } from 'googleapis';
import { config } from '../config.js';
const { validateURL, getInfo, filterFormats, chooseFormat } = ytdl;
google.options({auth: config.googleAPIKey});
const youtube = google.youtube("v3");

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

export const scrapePlaylist = async(url) => {
  if (!validateURL(url)) return undefined;
  const url2 = new URL(url);
  if (!url2.searchParams.has("list")) return [url];
  const res = await youtube.playlistItems.list({
    part: 'contentDetails',
    playlistId: url2.searchParams.get("list"),
    maxResults: 50 // TODO: change
  });
  if (res.status != 200) return undefined;
  const { items }= res.data
  const videoIds = items.map((v) => v.contentDetails.videoId)
  const id = videoIds.findIndex((v) => v == url2.searchParams.get("v"))
  const videoUrls = videoIds.slice(id).map((v) => `https://www.youtube.com/watch?v=${v}`)
  return videoUrls
}