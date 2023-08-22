import {Events, Interaction, SlashCommandBuilder, REST, Routes} from 'discord.js';
import { Client } from '../../Client';
import {Music} from '../../function/Music';
import fs from 'fs';
import path from 'path';


export default {
  name: Events.InteractionCreate,
  mode: '',
  /**
   * 
   * @param client 
   * @param player 
   * @returns 
   */
  exe: async (interaction: Interaction, music: Music, client: Client) => {
    if (interaction.isChatInputCommand()) {
      const command = Client.commandsExe.get(interaction.commandName);
      command(interaction, music, client)
    }
    return 0;
  }
  

}