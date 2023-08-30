import Bot from "bot";
import "dotenv/config";
import { VoiceConnection } from "module/voice";
import * as soundCloudDownloader from "soundcloud-downloader";

interface SongInfo {
  title: string;
  description: string;
  image: string;
}

class Song {
  constructor(info: SongInfo, url: string) {
    this.info = info;
    this.url = url;
  }

  public readonly info: SongInfo;
  public readonly url: string;
}

export enum Loop {
  Off,
  Queue,
  Song,
}

class Queue {
  constructor(data: Array<Song>, voice: VoiceConnection, loop: Loop) {
    this.data = data;
    this.voice = voice;
    this.loop = loop;
  }
  public readonly data: Array<Song>;
  public readonly voice: VoiceConnection;
  public loop: Loop;
}

export class Music {
  private bot: Bot;

  public readonly queues = new Map<string, Queue>(); // guildID, Queue

  public api = soundCloudDownloader.create({
    clientID: process.env.SoundCloudClientID,
  });

  public rawData = {} as any;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  public async search(input: string) {
    return await this.api.getInfo(input);
  }

  public async createQueue(id: string) {
    return this.queues.set(
      id,
      new Queue(new Array<Song>(), new VoiceConnection(this.bot), Loop.Off),
    );
  }

  public async addSong(
    guildID: string,
    input: string,
  ): Promise<Song | undefined> {
    const queue = this.queues.get(guildID);
    if (!queue) throw new Error("Queue not found");

    const result = await this.search(input);

    const song = new Song(
      {
        title: result.title || "Unknown Title",
        description: result.user ? result.user.username : "Unknown User",
        image: result.artwork_url || "",
      },
      result.permalink_url || "",
    );
    queue.data.push(song);
    this.queues.set(guildID, queue);

    return song;
  }
}
