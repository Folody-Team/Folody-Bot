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
import * as ntsuspend from "ntsuspend"
import { spawn, ChildProcessWithoutNullStreams } from "child_process"
import * as util from '../lib/suspend'
let counter = 0
// cre: Elysia
class UnixStream {

  public url: string;
  public socketPath: string;

  constructor(stream: stream.Stream, onSocket: ((socket: net.Socket) => void) | undefined) {
    if (process.platform === 'win32') {
      const pipePrefix = '\\\\.\\pipe\\';
      const pipeName = `node-webrtc.${++counter}.sock`;

      this.socketPath = path.join(pipePrefix, pipeName);
      this.url = this.socketPath;
    }
    else {
      this.socketPath = './' + (++counter) + '.sock'
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
  public playable!: Readable;
  public ffmpeg!: ChildProcessWithoutNullStreams | undefined;
  public udp!: Udp;
  public audioStream!: Audio;
  public opusStream!: prism.opus.Encoder;

  private isPaused: boolean = false;
  private cachedDuration: number = 0;

  constructor(playable: Readable, udp: Udp, ffmpegPath?: {
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


    let url = '';
    if (this.playable instanceof Readable) {
      url = StreamInput(this.playable as Readable).url
    } else {
      url = this.playable;
    }
    const opts = [`-re`, `-i`, "pipe:0", `-y`, `-ac`, `2`, `-b:a`, `192k`, `-ar`,
      `47999`, `-filter:a`, `volume=0.8`, `-vn`, `-loglevel`, `0`, `-preset`, `ultrafast`, `-fflags`, `nobuffer`,
      `-analyzeduration`, `0`, `-flags`, `low_delay`, `-f`, `s16le`, `${StreamOutput(this.opusStream).url}`]
    this.ffmpeg = spawn(`ffmpeg`, opts, {
      stdio: ['pipe']
    })

    this.ffmpeg.on("error", console.log)
    this.ffmpeg.on("message", console.log)
    this.ffmpeg.on("spawn", () => this.emit("spawnProcess", ""))
    this.ffmpeg.on("exit", () => this.emit("finish"))

    if (this.playable instanceof Readable) this.playable.pipe(this.ffmpeg.stdio[0])

    this.opusStream?.pipe(this.audioStream!, {
      end: false,
    });
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
    this.ffmpeg.stdin.write("\u0003")
    util.PrintOK.suspend(this.ffmpeg.pid);
    if (process.platform === 'win32') ntsuspend.suspend(this.ffmpeg.pid as number);
    else this.ffmpeg.kill('SIGSTOP');
    // cứ làm ik =))
    this.isPaused = true;
    this.cachedDuration = Date.now() - this.audioStream.startTime;
  }
  resume() {
    if (!this.ffmpeg)
      return this
    this.ffmpeg.stdin.write("\n")
    this.udp.voiceConnection.setSpeaking(true)
    this.isPaused = false;
    this.audioStream.startTime = Date.now() - this.cachedDuration;
    if (process.platform === 'win32') ntsuspend.resume(this.ffmpeg.pid as number);
    else this.ffmpeg.kill('SIGCONT');
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
  public static create = (playable: Readable, udp: Udp, ffmpegPath?: {
    ffmpeg: string;
  }) => {
    return new CorePlayer(playable, udp, ffmpegPath)
  }
}