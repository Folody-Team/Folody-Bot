import { ApplicationCommandType, CommandInteraction } from 'discord.js';
import { Folody } from '@Folody/client/Client';


export default {
  name: 'ping',
  description: 'Ping commands',
  type: ApplicationCommandType.ChatInput,
  init: (folody: Folody, interaction: CommandInteraction): void  => {
    interaction.reply('pong');
  },
}