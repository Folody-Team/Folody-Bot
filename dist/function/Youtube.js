"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolodyYoutube = void 0;
const regex_1 = require("@Folody/core/regex");
const Song_1 = require("@Folody/types/Song");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const ytpl_1 = __importDefault(require("ytpl"));
const ytsr_1 = __importDefault(require("ytsr"));
class FolodyYoutube {
    static async getVideoDetails(content) {
        const parsedContent = content.match(regex_1.FolodyRegex.youtubeVideoRegex);
        let id = '';
        if (!parsedContent) {
            const result = await this.searchVideo(content);
            if (!result)
                throw new Error();
            id = result;
        }
        else {
            id = parsedContent[1];
        }
        const videoUrl = this.generateVideoUrl(id);
        const result = await ytdl_core_1.default.getInfo(videoUrl);
        return {
            title: result.videoDetails.title,
            length: parseInt(result.videoDetails.lengthSeconds, 10),
            author: result.videoDetails.author.name,
            thumbnail: result.videoDetails.thumbnails[result.videoDetails.thumbnails.length - 1].url,
            url: videoUrl,
            platform: Song_1.Platform.YOUTUBE,
        };
    }
    static async getPlaylist(url) {
        const id = url.split('?')[1].split('=')[1];
        const playlist = await (0, ytpl_1.default)(id);
        const songs = [];
        playlist.items.forEach((item) => {
            songs.push({
                title: item.title,
                thumbnail: item.bestThumbnail.url || '',
                author: item.author.name,
                url: item.shortUrl,
                length: item.durationSec || 0,
                platform: Song_1.Platform.YOUTUBE,
            });
        });
        return {
            title: playlist.title,
            thumbnail: playlist.bestThumbnail.url || '',
            author: playlist.author.name,
            songs,
        };
    }
    static async searchVideo(keyword) {
        const result = await (0, ytsr_1.default)(keyword, { pages: 1 });
        const filteredRes = result.items.filter((item) => item.type === 'video');
        if (filteredRes.length === 0)
            throw new Error();
        const item = filteredRes[0];
        return item.id;
    }
    static isPlaylist(url) {
        const paths = url.match(regex_1.FolodyRegex.youtubePlaylistRegex);
        if (paths)
            return paths[0];
        return null;
    }
    static generateVideoUrl(id) {
        return `https://www.youtube.com/watch?v=${id}`;
    }
}
exports.FolodyYoutube = FolodyYoutube;
//# sourceMappingURL=Youtube.js.map