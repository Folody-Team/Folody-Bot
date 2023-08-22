import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import { Udp } from "../module/udp";
import { Readable } from 'stream';
import { EventEmitter } from "events";
import { Audio } from "./audio";
import prism from 'prism-media';
import net from "net";
import fs from "fs";
import path from "path";
import stream from "stream";

// cre: Elysia
class UnixStream {
  private counter = 0;

  public url: string;
  public socketPath: string;

  constructor (stream: stream.Stream, onSocket: ((socket: net.Socket) => void) | undefined) {
    if (process.platform === 'win32') {
      const pipePrefix = '\\\\.\\pipe\\';
      const pipeName = `node-webrtc.${++this.counter}.sock`;

      this.socketPath = path.join(pipePrefix, pipeName);
      this.url = this.socketPath;
    }
    else {
      this.socketPath = './' + (++this.counter) + '.sock'
      this.url = 'unix:' + this.socketPath
    }

    try {
      fs.statSync(this.socketPath)
      fs.unlinkSync(this.socketPath)
    } catch (err) {}
    const server = net.createServer(onSocket)
    stream.on('finish', () => {
      server.close()
    })
    server.listen(this.socketPath)
  }
}

function StreamInput (stream: stream.Readable) {
  return new UnixStream(stream, socket => stream.pipe(socket))
}

function StreamOutput (stream: stream.Writable) {
  return new UnixStream(stream, socket => socket.pipe(stream))
}
export { StreamOutput, StreamInput };

class CorePlayer extends EventEmitter {
  public playable!: string | Readable;
  public ffmpeg!: FfmpegCommand | undefined;
  public udp!: Udp;
  public audioStream!: Audio;
  public opusStream!: prism.opus.Encoder;

  constructor(playable: string | Readable, udp: Udp, ffmpegPath?: {
    ffmpeg: string;
  }) {
    super();
    if (typeof playable !== 'string' && !playable.readable) {
      console.log('PLAYER_MISSING_PLAYABLE');
    }
    if (!(udp instanceof Udp)) {
      console.log('PLAYER_MISSING_VOICE_UDP');
    }

    this.udp = udp;
    this.playable = playable;

  }

  public play() {
    this.audioStream = new Audio(
      this.udp as Udp,
    );

    this.opusStream = new prism.opus.Encoder({
      channels: 2,
      rate: 48000,
      frameSize: 960,
    });

    this.audioStream.on('finish', () => {
      this.emit('finishAudio');
    });

    this.ffmpeg = ffmpeg(this.playable)
      .inputOption('-re')
      .addOption('-loglevel', '0')
      .addOption('-preset', 'ultrafast')
      .addOption('-fflags', 'nobuffer')
      .addOption('-analyzeduration', '0')
      .addOption('-flags', 'low_delay')
      .noVideo()
      .on('end', () => {
        this.emit('finish');
      })
      .on('error', (err, stdout, stderr) => {
        this.ffmpeg = undefined;
        if (
          err.message.includes(
            'ffmpeg was killed with signal SIGINT',
          ) ||
          err.message.includes('ffmpeg exited with code 255')
        ) {
          return;
        }
        this.emit('error', err, stdout, stderr);
      })
      .on('start', (commandLine) => {
        this.emit('spawnProcess', commandLine);
      })
      .output(StreamOutput(this.opusStream).url, {
        end: false,
      })
      .audioChannels(2)
      .audioFrequency(48000)
      .format('s16le')
      .audioBitrate('164k')
      .audioFilters(
        `volume=0.5`,
      );

      this.ffmpeg.run();
      this.opusStream?.pipe(this.audioStream as Audio, {
        end: false,
      });
  }
}

export class Player {
  public static create = (playable: string | Readable, udp: Udp, ffmpegPath?: {
    ffmpeg: string;
  }) => {
    return new CorePlayer(playable, udp, ffmpegPath)
  }
}