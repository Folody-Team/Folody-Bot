import "dotenv/config"
import {Events, Interaction, SlashCommandBuilder, REST, Routes, Client} from 'discord.js';
import {Music} from '../../function/Music';

export default {
  name: Events.ClientReady,
  mode: '',
  /**
   * 
   * @param client 
   * @param player 
   * @returns 
   */
  exe: async (client: Client, music: Music) => {
    if (client.application?.id != process.env.Verify) {
      client.destroy();
    }
    return 0;
  }
  

}