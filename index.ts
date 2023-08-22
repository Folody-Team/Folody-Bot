import "dotenv/config"
import { Collection, IntentsBitField } from 'discord.js';
import fs from 'fs';
import {Music} from './function/Music'
import { Client } from './Client';
import path from 'path';

export const client = Client.init(process.env.TOKEN as string);

(async () => {
  const music = new Music(client);
  const clientDirSetup = path.join(__dirname, './events/client');
  const clientEventDirs: string[] = fs.readdirSync(clientDirSetup).filter(file => file.endsWith('.ts') ||  file.endsWith('.js'));
  
  for(const clientEventDir of clientEventDirs) {
    const events = require(path.join(clientDirSetup, clientEventDir));
    await client[events.default.mode == 'OneTime' ? 'once' : 'on'](events.default.name, (arg) =>  events.default.exe(arg, music, client))
  }

  
})()
