import { Song } from '@Folody/types/Song';
export interface Playlist {
    title: string;
    thumbnail: string;
    author: string;
    songs: Song[];
}
