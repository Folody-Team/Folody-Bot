import { messages } from '@Folody/messages';
import { QueueItem, Core, servers,FolodyYoutube } from '@Folody/function';
import { entersState, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { GuildMember, ApplicationCommandType, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Folody } from '@Folody/client/Client';


export default {
  name: 'play',
  description: 'Play command',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'song_name',
      description: 'Enter the name or url of the song',
      type: 3,
      required: true,
    },
  ],
  init: async (folody: Folody, interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();
    let server = servers.get(interaction.guildId as string);
    if (!server){
      if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
        const channel = interaction.member.voice.channel
        server = new Core(joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        }), interaction.guildId as string);
        servers.set(interaction.guildId as string, server);
      }
    }
    if (!server) return void interaction.followUp('Please join a voice channel and try again');
    try {
      await entersState(server.voiceConnection, VoiceConnectionStatus.Ready, 10e3);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
      return void interaction.followUp('Could not connect to voice channel');
    }
    try {
      const input = interaction.options.get('song_name')!.value! as string;
      const playListId = FolodyYoutube.isPlaylist(input);
      if (playListId) {
        const playlist = await FolodyYoutube.getPlaylist(playListId);
        const songs = playlist.songs.map((song) => {
          const queueItem: QueueItem = {
            song,
            requester: interaction.member?.user.username as string,
          };
          return queueItem;
        });
        await server.addSongs(songs);
        if (server.queue.length === 0) {
          await void interaction.followUp({
            embeds: [
              new EmbedBuilder()
              .setColor('#34eb56')
              .setTitle(playlist.title)
              .setDescription(`${messages.Status.title} \`${messages.Status.type[0]}\``)
            ]
          })
        } else {
          await void interaction.followUp(`Added ${playlist.title}`);
        }
      } else {
        
        const song = await FolodyYoutube.getVideoDetails(input);
        const queueItem: QueueItem = {
          song,
          requester: interaction.member?.user.username as string,
        };
        await server.addSongs([queueItem]);
        if (server.queue.length === 0) {
          await void interaction.followUp({
            embeds: [
              new EmbedBuilder()
              .setColor('#34eb56')
              .setTitle(song.title)
              .setDescription(`${messages.Status.title} \`${messages.Status.type[0]}\``)
            ]
          });
        } else {
          await void interaction.followUp(`Added ${song.title}`);
        }
        
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
      return await void interaction.followUp('Could not play song');
    }
  }
}
