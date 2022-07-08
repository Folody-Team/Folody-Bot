/* eslint-disable no-var */
import fs from 'fs';
import { Commands } from '@Folody/interfaces/Commands';
import { DiscordFetch } from '@Folody/function/index';
import { Folody } from '@Folody/client/Client';

/**
 * 
 * @param folody 
 */

var commands: Commands[] = [];

export async function slashCommands (folody: Folody) {
  
  fs.readdir(`${__dirname}/../commands/slash`, function(err, files) {
    if (err) throw err;
    files.forEach(file => {
      if (!file.endsWith('.js')) return;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const command = require(`@Folody/commands/slash/${file}`).default;
      /**
       * @param {Client} client
       * @param {string} token
       * @param {string} command
       */
      if (command.name) {
        const newCommand = {
          name: command.name ? command.name : file.split('.')[0],
          description: command.description ? command.description : null,
          type: command.type ? command.type : null,
          options: command.options ? command.options : null,
          init: command.init ? command.init : null,
        }
        // eslint-disable-next-line no-console
        console.log(`Loaded slash command ${newCommand.name}`);
        folody.commands.set(newCommand.name, newCommand);
        commands.push(newCommand);
      } else {
        // eslint-disable-next-line no-console
        console.log(`Failed to load slash command ${file}`);
      }
      
    });
    DiscordFetch({
      method: 'PUT',
      body: commands,
    }, `applications/${process.env.ID}/commands`)
  });
}