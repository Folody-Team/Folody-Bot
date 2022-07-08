import { ApplicationCommandType, CommandInteraction, GuildMember } from 'discord.js';
import { servers } from '@Folody/function/Core';
import { messages } from '@Folody/messages';
import { Folody } from '@Folody/client/Client';


export default {
  name: 'skip',
  description: 'Skip commands',
  type: ApplicationCommandType.ChatInput,
  init: async (folody: Folody, interaction: CommandInteraction): Promise<void>  => {
    interaction.deferReply();
    // if member is in other voice channel

    const server = servers.get(interaction.guildId as string);
    if (!server) return void await interaction.followUp('Please join a voice channel and try again');
    if (server.queue.length === 0) return void await interaction.followUp(messages.NoSong);

    server.play();
    if (server.playing) {
      await void interaction.followUp(messages.Skip);
    }
    
  },
}