import { Client, ClientOptions } from "discord.js";
import Command from "models/command";
import { Music } from "modules/music";

export default class Bot extends Client {
  constructor(options: ClientOptions) {
    super(options);

    this.music = new Music(this);
  }

  public readonly commands = new Map<string, Command>();
  public readonly music: Music;
}
