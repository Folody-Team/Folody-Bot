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
// import * as util from "ntsuspend"

// cre: Elysia
class UnixStream {
  private counter = 0;

  public url: string;
  public socketPath: string;

  constructor(stream: stream.Stream, onSocket: ((socket: net.Socket) => void) | undefined) {
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
    } catch (err) { }
    const server = net.createServer(onSocket)
    stream.on('finish', () => {
      server.close()
    })
    server.listen(this.socketPath)
  }
}

function StreamInput(stream: stream.Readable) {
  return new UnixStream(stream, socket => stream.pipe(socket))
}

function StreamOutput(stream: stream.Writable) {
  return new UnixStream(stream, socket => socket.pipe(stream))
}
export { StreamOutput, StreamInput };

export class CorePlayer extends EventEmitter {
  public playable!: string | Readable;
  public ffmpeg!: FfmpegCommand | undefined;
  public udp!: Udp;
  public audioStream!: Audio;
  public opusStream!: prism.opus.Encoder;

  private isPaused: boolean = false;
  private cachedDuration: number = 0;

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

  public play(seek?: string | number) {
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
      .on('start', (commandLine, ...another) => {
        this.emit('spawnProcess', commandLine);
      })
      .output(StreamOutput(this.opusStream).url, {
        end: false,
      })
      .audioChannels(2)
      .format('s16le')
      .audioBitrate(192)
      .audioFrequency(47999)
      .audioFilters(
        [`volume=0.8`]
      );
    if (seek) {
      this.ffmpeg.seekInput(this.cachedDuration)
    }
    this.ffmpeg.run();
    this.opusStream?.pipe(this.audioStream as Audio, {
      end: false,
    });
    this.ffmpeg.duration
    this.udp.voiceConnection.player = this
  }

  public stop() {
    if (this.ffmpeg) {
      this.opusStream?.destroy();
      this.audioStream?.destroy();
      this.ffmpeg.kill('SIGINT');
      this.ffmpeg = undefined;
    }
  }

  public pause() {
    if (!this.ffmpeg)
      return null

    this.isPaused = true;
    this.cachedDuration = Date.now() - this.audioStream.startTime;
    this.audioStream.pause(true)
  }
  resume() {
    if (!this.ffmpeg)
      return this

    this.udp.voiceConnection.setSpeaking(true)
    this.isPaused = false;
    this.audioStream.startTime = Date.now() - this.cachedDuration;
    this.audioStream.pause(false)
  }

  get currentTime() {
    if (this.audioStream.startTime == 0) return 0;
    if (this.isPaused == true) {
      return this.cachedDuration / 1000;
    } else {
      return (Date.now() - this.audioStream.startTime) / 1000;
    }
  }
}

export class Player {
  public static create = (playable: string | Readable, udp: Udp, ffmpegPath?: {
    ffmpeg: string;
  }) => {
    return new CorePlayer(playable, udp, ffmpegPath)
  }
}