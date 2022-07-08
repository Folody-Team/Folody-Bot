"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolodyRegex = void 0;
class FolodyRegex {
    /**
     * Regex for youtube video id
     */
    static youtubeVideoRegex = new RegExp(/(?:youtube\.com\/(?:[^\\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\\/\s]{11})/);
    static youtubePlaylistRegex = new RegExp(/(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*/);
}
exports.FolodyRegex = FolodyRegex;
//# sourceMappingURL=regex.js.map