import {Events, Client as Discord, SlashCommandBuilder, REST, Routes} from 'discord.js';
import { Client } from '../../Client';
import {Music} from '../../function/Music';
import fs from 'fs';
import path from 'path';


export default {
  name: Events.ClientReady,
  mode: 'OneTime',
  /**
   * 
   * @param client 
   * @param player 
   * @returns 
   */
  exe: async (client: Discord, music: Events) => {
    const slashFolders = fs.readdirSync(path.join(__dirname, '../../commands'));
    const commands = new Array<any>();
    const rest = new REST().setToken(client.token as string);

    const active = (data: any) => {
      const main = require(`../../commands/${data.replace(/\.[^/.]+$/, "")}`)
      commands.push(main.default.data.toJSON());
      Client.commandsExe.set(main.default.data.name, main.default.exe)
    }
    const loop = (l: number, r: number): void => {
      while (l <= r) {
        if (l === r) {
          active(slashFolders[l])
        } else {
          active(slashFolders[l])
          active(slashFolders[r])
        }
  
        ++l;
        --r;
      }
    }

    const mid = (l: number, r: number): void =>  {
      if((l+r)/2 > 3) {
        mid(l, (slashFolders.length-1)/2);
        mid((slashFolders.length-1)/2+1, r);
      } else {
        return loop(l, r);
      }
    }

    if(slashFolders.length == 1) {
      await active(slashFolders[0])
    } else {
      await mid(0, slashFolders.length-1);
    }

    (async () => {
      try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
    
        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
          Routes.applicationCommands(client?.application?.id as string),
          { body: commands },
        );
    
        console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
      } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
      }
    })();
    return 0;
  }
  

}