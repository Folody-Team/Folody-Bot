import { Playlist } from '@Folody/types/Playlist';
import { Song } from '@Folody/types/Song';
export declare class FolodyYoutube {
    static getVideoDetails(content: string): Promise<Song>;
    static getPlaylist(url: string): Promise<Playlist>;
    private static searchVideo;
    static isPlaylist(url: string): string | null;
    private static generateVideoUrl;
}
