import { Song } from '@Folody/types/Song';
import { AudioPlayer, VoiceConnection } from '@discordjs/voice';
export interface QueueItem {
    song: Song;
    requester: string;
}
export declare class Core {
    guildId: string;
    playing?: QueueItem;
    queue: QueueItem[];
    readonly voiceConnection: VoiceConnection;
    readonly audioPlayer: AudioPlayer;
    private isReady;
    constructor(voiceConnection: VoiceConnection, guildId: string);
    addSongs(queueItems: QueueItem[]): Promise<void>;
    stop(): void;
    leave(): void;
    pause(): void;
    resume(): void;
    jump(position: number): Promise<QueueItem>;
    remove(position: number): QueueItem;
    play(): Promise<void>;
}
export declare const servers: Map<string, Core>;
