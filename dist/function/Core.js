"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.servers = exports.Core = void 0;
const Song_1 = require("@Folody/types/Song");
const voice_1 = require("@discordjs/voice");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
class Core {
    guildId;
    playing;
    queue;
    voiceConnection;
    audioPlayer;
    isReady = false;
    constructor(voiceConnection, guildId) {
        this.voiceConnection = voiceConnection;
        this.guildId = guildId;
        this.audioPlayer = (0, voice_1.createAudioPlayer)();
        this.queue = [];
        this.playing = undefined;
        this.voiceConnection.on('stateChange', async (_, newState) => {
            if (newState.status === voice_1.VoiceConnectionStatus.Disconnected) {
                if (newState.reason === voice_1.VoiceConnectionDisconnectReason.WebSocketClose &&
                    newState.closeCode === 4014) {
                    try {
                        await (0, voice_1.entersState)(this.voiceConnection, voice_1.VoiceConnectionStatus.Connecting, 5_000);
                    }
                    catch (e) {
                        this.leave();
                    }
                }
                else if (this.voiceConnection.rejoinAttempts < 5) {
                    this.voiceConnection.rejoin();
                }
                else {
                    this.leave();
                }
            }
            else if (newState.status === voice_1.VoiceConnectionStatus.Destroyed) {
                this.leave();
            }
            else if (!this.isReady &&
                (newState.status === voice_1.VoiceConnectionStatus.Connecting ||
                    newState.status === voice_1.VoiceConnectionStatus.Signalling)) {
                this.isReady = true;
                try {
                    await (0, voice_1.entersState)(this.voiceConnection, voice_1.VoiceConnectionStatus.Ready, 15_000);
                }
                catch {
                    if (this.voiceConnection.state.status !==
                        voice_1.VoiceConnectionStatus.Destroyed)
                        this.voiceConnection.destroy();
                }
                finally {
                    this.isReady = false;
                }
            }
        });
        this.audioPlayer.on('stateChange', async (oldState, newState) => {
            if (newState.status === voice_1.AudioPlayerStatus.Idle &&
                oldState.status !== voice_1.AudioPlayerStatus.Idle) {
                await this.play();
            }
        });
        voiceConnection.subscribe(this.audioPlayer);
    }
    async addSongs(queueItems) {
        this.queue = this.queue.concat(queueItems);
        if (!this.playing) {
            await this.play();
        }
    }
    stop() {
        this.playing = undefined;
        this.queue = [];
        this.audioPlayer.stop();
    }
    leave() {
        if (this.voiceConnection.state.status !== voice_1.VoiceConnectionStatus.Destroyed) {
            this.voiceConnection.destroy();
        }
        this.stop();
        exports.servers.delete(this.guildId);
    }
    pause() {
        this.audioPlayer.pause();
    }
    resume() {
        this.audioPlayer.unpause();
    }
    async jump(position) {
        const target = this.queue[position - 1];
        this.queue = this.queue
            .splice(0, position - 1)
            .concat(this.queue.splice(position, this.queue.length - 1));
        this.queue.unshift(target);
        await this.play();
        return target;
    }
    remove(position) {
        return this.queue.splice(position - 1, 1)[0];
    }
    async play() {
        try {
            if (this.queue.length > 0) {
                this.playing = this.queue.shift();
                let stream;
                const highWaterMark = 1024 * 1024 * 10;
                if (this.playing?.song.platform === Song_1.Platform.YOUTUBE) {
                    stream = (0, ytdl_core_1.default)(this.playing.song.url, {
                        highWaterMark,
                        filter: 'audioonly',
                        quality: 'highestaudio',
                    });
                }
                else {
                    return;
                }
                const audioResource = (0, voice_1.createAudioResource)(stream);
                this.audioPlayer.play(audioResource);
            }
            else {
                this.playing = undefined;
                this.audioPlayer.stop();
            }
        }
        catch (e) {
            this.play();
        }
    }
}
exports.Core = Core;
exports.servers = new Map();
//# sourceMappingURL=Core.js.map