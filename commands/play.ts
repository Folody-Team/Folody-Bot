import { SlashCommandBuilder, ChatInputCommandInteraction, Guild, EmbedBuilder, Client, Events, WebSocketShard } from "discord.js";
import path from "path";
import { WebSocket } from 'ws';
import { Music } from "../function/Music";
import fs from 'fs';
import { createSocket } from "dgram";
import { VoiceConnection } from "../module/voice";
import { Player } from "../media/Player";


export default {
  data: new SlashCommandBuilder()
    .setName(path.basename(__filename).replace(/\.[^/.]+$/, ""))
    .setDescription('Play music')
    .addStringOption(option => option.setName('input').setDescription('Enter url')),
  exe: async (interaction: ChatInputCommandInteraction, music: Music, client: Client) => {
    const url = interaction.options.getString('input')
    const guild = interaction.guildId;

    if (!music.data.has(guild as string)) {
      music.createQueue(guild as string);
      await music.addSong(guild as string, url as string);
      const channel = interaction.guild?.members.cache.get((interaction.member as any).user.id)?.voice.channel?.id as string;
      const gateway = client.guilds.cache.get(guild as string)?.shard as WebSocketShard;

      const voiceConnection = new VoiceConnection(client);

      gateway.send({
        op: 2 << 1,
        d: {
          guild_id: guild,
          channel_id: channel,
          self_mute: false,
          self_deaf: true,
        }
      })
      const playing = (music.data.get(guild as string) as any)[0]

      client.on(Events.Raw, (packet) => {
        if (packet.t == 'VOICE_STATE_UPDATE') {
          voiceConnection.session(packet.d.session_id)
          
        }
        if (packet.t == 'VOICE_SERVER_UPDATE') {
          voiceConnection.init(guild as string, client.user?.id as string, packet.d.token)
          voiceConnection.connect(`wss://${packet.d.endpoint}/?v=4`)
          
          music.api.download(playing.url as string).then(stream => {
            console.log(stream)
            const player = Player.create(stream, voiceConnection.udp)
            player.once('spawnProcess', () => {
              voiceConnection.setSpeaking(true);
            })

            player.once('finish', () => {
              voiceConnection.setSpeaking(false);
            })


            player.play();
    
    
          })
        }

      })

      client.on(Events.VoiceStateUpdate, (_, __) => {
        // gateway.send({

        // })
      })

      // const connection = joinVoiceChannel({
      //   channelId: interaction.guild?.members.cache.get((interaction.member as any).user.id)?.voice.channel?.id as string,
      //   guildId: guild as string,
      //   adapterCreator: (interaction.guild as Guild).voiceAdapterCreator,
      // });

      // const player = createAudioPlayer({
      //   behaviors: {
      //     noSubscriber: NoSubscriberBehavior.Pause,
      //   },
      // });

      
      

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(playing.info.title as string)
            .setThumbnail(playing.info.image as string)
        ]
      })
      // player.on(AudioPlayerStatus.Playing, () => {
      //   console.log(true)
      // })
    }

  }
}