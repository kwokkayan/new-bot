import { spawn } from 'node:child_process';
import { createVideoStream } from "./youtube.js";
import { log } from '../config.js';
import sharp from 'sharp';
import { Readable, Writable } from 'node:stream';
import { createWriteStream } from 'node:fs';

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

export const getAsciiVideo = async (url, fps, width, height) => {
  const frames = await getFrameBuffersFromVideo(url, fps, width, height);
  const imgBuffers = await Promise.all(frames.map((f) =>
    sharp({
      text: {
        text: `<span background="black" foreground="white">${f}</span>`,
        rgba: true,
        width: width * 8,
        height: height * 8,
        font: "Courier",
      }
    })
      .png()
      .toBuffer()
  ))
  return new Promise((resolve, reject) => {
    const imgStream = Readable.from(imgBuffers.reduce((acc, curr) => Buffer.concat([acc, curr]), Buffer.from([])))
    const ffmpeg = spawn('ffmpeg', [
      '-framerate',
      `${fps}`,
      '-f',
      'image2pipe',
      '-i',
      'pipe:0',
      '-c:v',
      'copy',
      '-f',
      'mp4',
      '-movflags',
      'isml+frag_keyframe',
      '-r',
      `${fps}`,
      'pipe:1',
    ]);
    imgStream.pipe(ffmpeg.stdin);

    ffmpeg.stderr.on("data", (data) => {
      log.error(`${data.toString()}`)
    })

    ffmpeg.stdout.pipe(createWriteStream('temp.mp4'));

    ffmpeg.on("exit", (code) => {
      if (code == 0)
        resolve("temp.mp4");
      else
        reject("");
    });

    ffmpeg.on('error', () => {
      reject("");
    })
  });
}