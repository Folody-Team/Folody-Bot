export declare enum Platform {
    YOUTUBE = "Youtube"
}
export interface Song {
    title: string;
    length: number;
    author: string;
    thumbnail: string;
    url: string;
    platform: Platform;
}
