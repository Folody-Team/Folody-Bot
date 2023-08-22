import {Client} from 'discord.js';
import {create} from 'soundcloud-downloader'
import ytdl from 'ytdl-core';
import "dotenv/config"
import zlib from 'zlib';
import crypto from 'crypto';
import {hideData, showData} from './Cipher';
import axios from 'axios';

type data = {
  info: {
    title: string,
    description: string,
    image: string,
  },
  url: string,
}
export class Music {
  private client: Client;

  public data = new Map<string, Array<data>>();

  public api = create({
    clientID: process.env.ID,
  })

  public rawData = {} as any;
  /**
   * 
   * @param client 
   */
  constructor(client: Client) {
    this.client = client;
  }

  /**
   * 
   * @param input 
   * @returns 
   */
  public async search(input: string) {
    return await this.api.getInfo(input)
  }

  public async createQueue(id: string) {
    const songData = new Array<data>();
    return this.data.set(id, songData);
  }
  /**
   * 
   * @param input 
   */
  public async addSong(id: string, input: string) {
    const songInfo = await this.search(input);
    if(this.data.has(id)) {
      const queue = this.data.get(id);
      queue?.push({
        info: {
          title: songInfo.title as string,
          description: songInfo.description as string,
          image: songInfo.artwork_url as string,
        },
        url: songInfo.permalink_url as string
      })
      this.data.set(id, queue as data[]);
    }


  }
}