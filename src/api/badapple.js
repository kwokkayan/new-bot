import { spawn } from 'node:child_process';
import { createVideoStream } from "./youtube.js";
import { log } from '../config.js';
import sharp from 'sharp';
import { Writable } from 'node:stream';

export const getFrameBuffersFromVideo = async (url, fps, width, height) => {
  const videoStream = await createVideoStream(url);
  if (videoStream === undefined) return undefined;
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
  /**
   * TODO: parse the chunks before passing to sharp (check for png header and so on...) 
   */
  class PngToRawStream extends Writable {
    buffers = [];
    constructor(opt) {
      super(opt);
      // ...
    }

    _final(callback) {
      callback();
    }

    _writev(chunks, callback) {
      chunks.map(({ chunk, encoding }) => {
        sharp(chunk).resize(width, height).greyscale().raw().toBuffer((err, data, info) => {
          if (data !== undefined)
            this.buffers.push(data);
        });
      })
      callback();
    }

    _write(chunk, encoding, callback) {
      sharp(chunk).resize(width, height).greyscale().raw().toBuffer((err, data, info) => {
        if (data !== undefined)
          this.buffers.push(data);
      });
      callback();
    }
  }

  const pngToRawStream = new PngToRawStream();

  videoStream.pipe(ffmpeg.stdin);
  ffmpeg.stdout.pipe(pngToRawStream);

  ffmpeg.stderr.on("data", (data) => {
    log.error(`${data.toString()}`)
  })

  return new Promise((resolve, reject) => {
    pngToRawStream.on("finish", async () => {
      const buffers = pngToRawStream.buffers;
      resolve(
        buffers.map(
          (b) => Array.from(b)
            .map((v) => luminance[Math.floor((v / 255) * (luminance.length - 1))])
            .reduce((acc, curr, i) => (i > 0 && i % width === 0) ? `${acc}\n${curr}` : `${acc}${curr}`)
        )
      );
    });
    pngToRawStream.on('error', () => {
      reject([])
    })
  });

}