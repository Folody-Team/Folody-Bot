var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "../module/udp", "stream", "events", "./audio", "prism-media", "net", "fs", "path", "child_process"], function (require, exports, udp_1, stream_1, events_1, audio_1, prism_media_1, net_1, fs_1, path_1, child_process_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Player = exports.CorePlayer = exports.StreamInput = exports.StreamOutput = void 0;
    prism_media_1 = __importDefault(prism_media_1);
    net_1 = __importDefault(net_1);
    fs_1 = __importDefault(fs_1);
    path_1 = __importDefault(path_1);
    let counter = 0;
    // cre: Elysia
    class UnixStream {
        constructor(stream, onSocket) {
            if (process.platform === 'win32') {
                const pipePrefix = '\\\\.\\pipe\\';
                const pipeName = `node-webrtc.${++counter}.sock`;
                this.socketPath = path_1.default.join(pipePrefix, pipeName);
                this.url = this.socketPath;
            }
            else {
                this.socketPath = './' + (++counter) + '.sock';
                this.url = 'unix:' + this.socketPath;
            }
            try {
                fs_1.default.statSync(this.socketPath);
                fs_1.default.unlinkSync(this.socketPath);
            }
            catch (err) { }
            const server = net_1.default.createServer(onSocket);
            stream.on('finish', () => {
                server.close();
            });
            server.listen(this.socketPath);
        }
    }
    function StreamInput(stream) {
        return new UnixStream(stream, socket => stream.pipe(socket));
    }
    exports.StreamInput = StreamInput;
    function StreamOutput(stream) {
        return new UnixStream(stream, socket => socket.pipe(stream));
    }
    exports.StreamOutput = StreamOutput;
    class CorePlayer extends events_1.EventEmitter {
        constructor(playable, udp, ffmpegPath) {
            super();
            this.isPaused = false;
            this.cachedDuration = 0;
            if (typeof playable !== 'string' && !playable.readable) {
                console.log('PLAYER_MISSING_PLAYABLE');
            }
            if (!(udp instanceof udp_1.Udp)) {
                console.log('PLAYER_MISSING_VOICE_UDP');
            }
            this.udp = udp;
            this.playable = playable;
        }
        play(seek) {
            var _a;
            this.audioStream = new audio_1.Audio(this.udp);
            this.opusStream = new prism_media_1.default.opus.Encoder({
                channels: 2,
                rate: 48000,
                frameSize: 960,
            });
            this.audioStream.on('finish', () => {
                this.emit('finishAudio');
            });
            const opts = [`-re`, `-i`, "pipe:0", `-y`, `-ac`, `2`, `-b:a`, `192k`, `-ar`,
                `47999`, `-filter:a`, `volume=0.8`, `-vn`, `-loglevel`, `0`, `-preset`, `ultrafast`, `-fflags`, `nobuffer`,
                `-analyzeduration`, `0`, `-flags`, `low_delay`, `-f`, `s16le`, `pipe:1`];
            this.ffmpeg = (0, child_process_1.spawn)(`ffmpeg`, opts, {
                stdio: ['pipe']
            });
            this.ffmpeg.on("error", console.log);
            this.ffmpeg.on("message", console.log);
            this.ffmpeg.on("spawn", () => this.emit("spawnProcess", ""));
            this.ffmpeg.on("exit", () => this.emit("finish"));
            if (this.playable instanceof stream_1.Readable)
                this.playable.on('data', (chunk) => {
                    this.ffmpeg.stdio[0].write(chunk);
                });
            this.ffmpeg.stdout.pipe(this.opusStream, {
                end: false
            });
            (_a = this.opusStream) === null || _a === void 0 ? void 0 : _a.pipe(this.audioStream, {
                end: false,
            });
            this.udp.voiceConnection.player = this;
        }
        stop() {
            var _a, _b;
            if (this.ffmpeg) {
                (_a = this.opusStream) === null || _a === void 0 ? void 0 : _a.destroy();
                (_b = this.audioStream) === null || _b === void 0 ? void 0 : _b.destroy();
                this.ffmpeg.kill('SIGINT');
                this.ffmpeg = undefined;
                this.udp.voiceConnection.player = undefined;
            }
        }
        pause() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.ffmpeg)
                    return null;
                this.playable.unpipe(this.ffmpeg.stdin);
                yield this.opusStream.unpipe(this.audioStream);
                this.isPaused = true;
                this.cachedDuration = Date.now() - this.audioStream.startTime;
            });
        }
        resume() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.ffmpeg)
                    return this;
                this.playable.pipe(this.ffmpeg.stdin);
                yield this.opusStream.pipe(this.audioStream);
                this.isPaused = false;
                this.audioStream.startTime = Date.now() - this.cachedDuration;
            });
        }
        get currentTime() {
            if (this.audioStream.startTime == 0)
                return 0;
            if (this.isPaused == true) {
                return this.cachedDuration / 1000;
            }
            else {
                return (Date.now() - this.audioStream.startTime) / 1000;
            }
        }
    }
    exports.CorePlayer = CorePlayer;
    class Player {
    }
    exports.Player = Player;
    Player.create = (playable, udp, ffmpegPath) => {
        return new CorePlayer(playable, udp, ffmpegPath);
    };
});
