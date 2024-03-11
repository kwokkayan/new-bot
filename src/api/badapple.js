import { spawn } from 'node:child_process';
import { createVideoStream } from "./youtube.js";
import { log } from '../config.js';
import sharp from 'sharp';
export const getFrameBuffersFromVideo = async (url, fps, width, height) => {
  const videoStream = await createVideoStream(url);
  if (videoStream === undefined) return undefined;
  log.info("stream created")
  log.info(videoStream)
  const luminance = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\"^'. ".split('').reverse().join('');
  const ffmpeg = spawn('ffmpeg', [
    '-i',
    'pipe:0',
    '-r',
    `${fps}`,
    '-f',
    'image2pipe',
    '-c',
    'png',
    'pipe:1',
  ]);

  videoStream.pipe(ffmpeg.stdin);

  ffmpeg.stderr.on("data", (data) => {
    log.error(`${data.toString()}`)
  })

  const getFrames = async () => {
    return new Promise((resolve, reject) => {
      const _buf = [];
      ffmpeg.stdout.on("data",
        (chunk) => _buf.push(chunk)
      );
      ffmpeg.stdout.on("end", () =>
        resolve(
          _buf.map(
            async (b) => {
              try {
                return Array.from(await sharp(b).resize(width, height).greyscale().raw().toBuffer())
                  .map((v) => luminance[Math.floor((v / 255) * (luminance.length - 1))])
                  .reduce((acc, curr, i) => (i > 0 && i % width === 0) ? `${acc}\n${curr}` : `${acc}${curr}`)
              } catch {
                const widthline = `${"".padEnd(width, luminance[0])}\n`;
                const emptyFrame = `${"".padEnd(width * height, widthline)}`;
                return emptyFrame;
              }
            }
          )
        )
      );
      ffmpeg.stdout.on("error", (err) => reject(err));
    })
  }
  const frames = await Promise.all(await getFrames());
  return frames
}