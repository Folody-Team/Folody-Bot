import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { EventEmitter } from "events";
import fs from "fs";
import UDP from "modules/udp";
import net from "net";
import path from "path";
import prism from "prism-media";
import stream, { Readable } from "stream";
import Audio from "./audio";
let counter = 0;

class UnixStream {
  // cre: Elysia

  public url: string;
  public socketPath: string;

  constructor(
    stream: stream.Stream,
    onSocket: ((socket: net.Socket) => void) | undefined,
  ) {
    if (process.platform === "win32") {
      const pipePrefix = "\\\\.\\pipe\\";
      const pipeName = `node-webrtc.${++counter}.sock`;

      this.socketPath = path.join(pipePrefix, pipeName);
      this.url = this.socketPath;
    } else {
      this.socketPath = "./" + ++counter + ".sock";
      this.url = "unix:" + this.socketPath;
    }

    try {
      fs.statSync(this.socketPath);
      fs.unlinkSync(this.socketPath);
    } catch (err) {}
    const server = net.createServer(onSocket);
    stream.on("finish", () => {
      server.close();
    });
    server.listen(this.socketPath);
  }
}

function StreamInput(stream: stream.Readable) {
  return new UnixStream(stream, (socket) => stream.pipe(socket));
}

function StreamOutput(stream: stream.Writable) {
  return new UnixStream(stream, (socket) => socket.pipe(stream));
}
export { StreamInput, StreamOutput };

// export class OldCorePlayer extends EventEmitter {
//   public playable!: Readable;
//   public ffmpeg!: ChildProcessWithoutNullStreams | undefined;
//   public udp: UDP;
//   public audioStream!: Audio;
//   public opusStream!: prism.opus.Encoder;

//   private isPaused: boolean = false;
//   private cachedDuration: number = 0;

//   constructor(playable: Readable, udp: UDP) {
//     super();
//     if (typeof playable !== "string" && !playable.readable) {
//       console.log("PLAYER_MISSING_PLAYABLE");
//     }
//     if (!(udp instanceof UDP)) {
//       console.log("PLAYER_MISSING_VOICE_UDP");
//     }

//     this.udp = udp;
//     this.playable = playable;
//   }

//   public play(seek?: number) {
//     this.audioStream = new Audio(this.udp);

//     this.opusStream = new prism.opus.Encoder({
//       channels: 2,
//       rate: 48000,
//       frameSize: 960,
//     });

//     this.audioStream.on("finish", () => {
//       this.emit("finishAudio");
//     });

//     const opts = [
//       `-re`,
//       `-i`,
//       "pipe:0",
//       `-y`,
//       `-ac`,
//       `2`,
//       `-b:a`,
//       `192k`,
//       `-ar`,
//       `47999`,
//       `-filter:a`,
//       `volume=0.8`,
//       `-vn`,
//       `-loglevel`,
//       `0`,
//       `-preset`,
//       `ultrafast`,
//       `-fflags`,
//       `nobuffer`,
//       `-analyzeduration`,
//       `0`,
//       `-flags`,
//       `low_delay`,
//       `-f`,
//       `s16le`,
//       `pipe:1`,
//     ];

//     this.ffmpeg = spawn("ffmpeg", opts, {
//       stdio: ["pipe"],
//     });

//     this.ffmpeg.on("spawn", () => this.emit("spawnProcess", ""));
//     this.ffmpeg.on("close", () => this.emit("finish"));

//     if (this.playable instanceof Readable)
//       this.playable.pipe(
//         (this.ffmpeg as ChildProcessWithoutNullStreams).stdio[0],
//       );

//     this.ffmpeg.stdout.pipe(this.opusStream);
//     this.opusStream?.pipe(this.audioStream!, {
//       end: true,
//     });
//     this.udp.voiceConnection.player = this;
//   }

//   public stop() {
//     if (this.ffmpeg) {
//       this.opusStream?.destroy();
//       this.audioStream?.destroy();
//       this.ffmpeg.kill("SIGINT");
//       this.ffmpeg = undefined;
//       this.udp.voiceConnection.player = undefined;
//     }
//   }

//   public async pause() {
//     if (!this.ffmpeg) return null;

//     this.playable.unpipe(this.ffmpeg.stdin);
//     this.opusStream.unpipe(this.audioStream);

//     this.isPaused = true;
//     this.cachedDuration = Date.now() - this.audioStream.startTime;
//   }
//   public async resume() {
//     if (!this.ffmpeg) return this;

//     this.playable.pipe(this.ffmpeg.stdin);
//     this.opusStream.pipe(this.audioStream);

//     this.isPaused = false;
//     this.audioStream.startTime = Date.now() - this.cachedDuration;
//   }

//   get currentTime() {
//     if (this.audioStream.startTime == 0) return 0;
//     if (this.isPaused == true) {
//       return this.cachedDuration / 1000;
//     }
//     return (Date.now() - this.audioStream.startTime) / 1000;
//   }
// }

//
//
//
//
//
//

class Queue {
  private _current?: Readable;
  public get current() {
    return this._current;
  }

  private queue: Readable[] = [];

  constructor() {}

  public add(playable: Readable) {
    this.queue.push(playable);
  }

  public remove(index: number) {
    this.queue.splice(index, 1);
  }

  public clear() {
    this.queue = [];
  }

  public get length() {
    return this.queue.length;
  }

  public get next() {
    this._current = this.queue.shift();
    return this._current;
  }
}

export class Player extends EventEmitter {
  public readonly queue = new Queue();

  protected ffmpeg?: ChildProcessWithoutNullStreams;
  private udp: UDP = new UDP();
  protected audioStream?: Audio;
  protected opusStream?: prism.opus.Encoder;

  protected _playing: boolean = false;
  private pausedAt: number = 0;

  public get playing() {
    return this._playing;
  }

  constructor() {
    super();
  }

  public get position() {
    if (!this.audioStream || this.audioStream.startTime == 0) return 0;
    if (this._playing == false) return this.pausedAt;

    return this.audioStream.count;
  }

  public play(track: Readable) {
    this.audioStream = new Audio(this.udp);

    this.opusStream = new prism.opus.Encoder({
      channels: 2,
      rate: 48000,
      frameSize: 960,
    });

    this.audioStream.on("finish", () => this.emit("end"));

    const opts = [
      `-re`,
      `-i`,
      "pipe:0",
      `-y`,
      `-ac`,
      `2`,
      `-b:a`,
      `192k`,
      `-ar`,
      `47999`,
      `-filter:a`,
      `volume=0.8`,
      `-vn`,
      `-loglevel`,
      `0`,
      `-preset`,
      `ultrafast`,
      `-fflags`,
      `nobuffer`,
      `-analyzeduration`,
      `0`,
      `-flags`,
      `low_delay`,
      `-f`,
      `s16le`,
      `pipe:1`,
    ];

    this.ffmpeg = spawn("ffmpeg", opts, {
      stdio: ["pipe"],
    });

    this.ffmpeg.on("spawn", () => this.emit("ready"));

    this.ffmpeg.stdout.pipe(this.opusStream);
    this.opusStream.pipe(this.audioStream, {
      end: true,
    });

    track.pipe(this.ffmpeg.stdio[0]);
  }

  public stop() {
    if (!this.ffmpeg || !this.audioStream || !this.opusStream) {
      throw new PlayerNotPlaying();
    }

    this.opusStream.destroy();
    this.audioStream.destroy();
    this.ffmpeg.kill("SIGINT");
    this.ffmpeg = undefined;
  }

  public pause() {
    if (!this.ffmpeg || !this.audioStream || !this.opusStream)
      throw new PlayerNotPlaying();

    this.opusStream.unpipe(this.audioStream);

    this._playing = false;
    this.pausedAt = this.audioStream.count;
  }
  public resume() {
    if (!this.ffmpeg || !this.audioStream || !this.opusStream)
      throw new PlayerNotPlaying();

    this.opusStream.pipe(this.audioStream);

    this._playing = false;
    this.audioStream.count = this.pausedAt;
  }

  public seek(time: number) {
    if (!this.ffmpeg || !this.audioStream || !this.opusStream)
      throw new PlayerNotPlaying();

    this.audioStream.count = time;
  }
}
