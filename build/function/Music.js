"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Music = exports.LoopType = void 0;
// @ts-ignore 
// @ts-nocheck
const soundcloud_downloader_1 = require("soundcloud-downloader");
require("dotenv/config");
const voice_1 = require("../module/voice");
var LoopType;
(function (LoopType) {
    LoopType[LoopType["None"] = 0] = "None";
    LoopType[LoopType["Queue"] = 1] = "Queue";
    LoopType[LoopType["Song"] = 2] = "Song";
})(LoopType || (exports.LoopType = LoopType = {}));
class Music {
    /**
     *
     * @param client
     */
    constructor(client) {
        this.data = new Map();
        this.api = (0, soundcloud_downloader_1.create)({
            clientID: process.env.ID,
        });
        this.rawData = {};
        this.client = client;
    }
    /**
     *
     * @param input
     * @returns
     */
    search(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.api.getInfo(input);
        });
    }
    createQueue(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const songData = {
                voice: new voice_1.VoiceConnection(this.client),
                data: new Array(),
                loop: LoopType.None
            };
            return this.data.set(id, songData);
        });
    }
    /**
     *
     * @param input
     */
    addSong(id, input) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const songInfo = yield this.search(input);
            if (this.data.has(id)) {
                const queue = this.data.get(id);
                queue === null || queue === void 0 ? void 0 : queue.data.push({
                    info: {
                        title: songInfo.title,
                        description: (_a = songInfo.user) === null || _a === void 0 ? void 0 : _a.username,
                        image: songInfo.artwork_url,
                    },
                    url: songInfo.permalink_url
                });
                this.data.set(id, queue);
                return `${songInfo.title}`;
            }
        });
    }
}
exports.Music = Music;
