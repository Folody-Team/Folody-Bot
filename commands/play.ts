import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Client, Events, WebSocketShard } from "discord.js";
import path from "path";
import { LoopType, Music, Queue } from "../function/Music";
import { VoiceConnection } from "../module/voice";
import { Player } from "../media/Player";

/**
 * 
 * @param url 
 * @param queue 
 * @param music 
 * @param guild 
 * @param channel 
 * @param gateway 
 */
function musicPlay(
  url: string,
  queue: Queue,
  music: Music,
  guild: string,
  channel: string,
  gateway: WebSocketShard
) {
  music.api.download(url as string).then(stream => {
    const player = Player.create(stream, queue.voice.udp)
    player.once('spawnProcess', () => {
      // làm j có event này
      queue?.voice.setSpeaking(true);
    })

    player.once('finish', () => {
      console.log("finish")
      queue?.voice.setSpeaking(false);

      
      
      if (queue.data.length == 1 && queue.loop == LoopType.None) {
        player.stop()
        console.log(queue)
        gateway.send({
          op: 4,
          d: {
            guild_id: guild,
            channel_id: null,
            self_mute: null,
            self_deaf: null,
          }
        })
        queue.voice.shard.send(JSON.stringify({
          op: 4,
          d: {
            guild_id: guild,
            channel_id: null,
            self_mute: null,
            self_deaf: null,
          }
        }))
        queue.data.splice(0, queue.data.length);
        queue.voice.disconnect();
        music.data.delete(guild)
      } else if (queue.loop == LoopType.Queue || queue.loop == LoopType.None) {
        const lastQueueSong = queue?.data.shift()
        if (queue.loop == LoopType.Queue) {
          if (lastQueueSong) queue.data.push({
            ...lastQueueSong
          })
        };

        musicPlay(
          queue?.data[0].url,
          queue,
          music,
          guild,
          channel,
          gateway
        );

      } else if (queue.loop == LoopType.Song) {
        musicPlay(
          queue?.data[0].url,
          queue,
          music,
          guild,
          channel,
          gateway
        );
      } else {
        console.log(queue.loop)
      }
    })
    player.play();
  })
}
export default {
  data: new SlashCommandBuilder()
    .setName(path.basename(__filename).replace(/\.[^/.]+$/, ""))
    .setDescription('Play music')
    .addStringOption(option => option.setName('input').setDescription('Enter url').setRequired(true)),
  /**
   * 
   * @param interaction 
   * @param music 
   * @param client 
   * @returns 
   */
  exe: async (interaction: ChatInputCommandInteraction, music: Music, client: Client) => {
    const url = interaction.options.getString('input');
    if (!url?.match(/^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/)) {
      return await interaction.reply('You must enter soundcloud link!')
    }
    const guild = interaction.guildId;
    const channel = interaction.guild?.members.cache.get((interaction.member as any).user.id)?.voice.channel?.id as string;
    const gateway = client.guilds.cache.get(guild as string)?.shard as WebSocketShard;
    if (!music.data.has(guild as string)) {
      music.createQueue(guild as string);
      await music.addSong(guild as string, url as string);
      const queue = music.data.get(guild as string)!
      gateway.send({
        op: 2 << 1,
        d: {
          guild_id: guild,
          channel_id: channel,
          self_mute: false,
          self_deaf: true,
        }
      });

      const playing = queue.data[0]

      client.on(Events.Raw, (packet) => {
        if (packet.t == 'VOICE_STATE_UPDATE') {
          queue?.voice.session(packet.d.session_id)
        }
        if (packet.t == 'VOICE_SERVER_UPDATE') {
          queue?.voice.init(guild as string, client.user?.id as string, packet.d.token)
          queue?.voice.connect(`wss://${packet.d.endpoint}/?v=4`)
          
          musicPlay(
            playing.url as string,
            queue, music,
            guild as string,
            channel as string,
            gateway
          );
        }
      })

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(playing.info.title)
            .setDescription(`${(playing.info.description as string)[0].match(/[!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/) ? `\\${playing.info.description}` : playing.info.description}`)
        ]
      })
    } else {
      const song = await music.addSong(guild as string, url as string);
      const queue = music.data.get(guild as string);

      console.log(music.data)
      if (queue?.data.length == 0) {
        // gateway.send({
        //   op: 2 << 1,
        //   d: {
        //     guild_id: guild,
        //     channel_id: channel,
        //     self_mute: false,
        //     self_deaf: true,
        //   }
        // });
        // const playing = queue.data[0];
        // client.on(Events.Raw, (packet) => {
        //   if (packet.t == 'VOICE_STATE_UPDATE') {
        //     queue?.voice.session(packet.d.session_id)
        //   }
        //   if (packet.t == 'VOICE_SERVER_UPDATE') {
        //     queue?.voice.init(guild as string, client.user?.id as string, packet.d.token)
        //     queue?.voice.connect(`wss://${packet.d.endpoint}/?v=4`)

        //     musicPlay(
        //       playing.url as string,
        //       queue, music,
        //       guild as string,
        //       channel as string,
        //       gateway
        //     );
        //   }
        // })


        // await interaction.reply({
        //   embeds: [
        //     new EmbedBuilder()
        //       .setTitle(playing.info.title)
        //       .setDescription(`${(playing.info.description as string)[0].match(/[!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/) ? `\\${playing.info.description}` : playing.info.description}`)
        //   ]
        // })
      } else {

        await interaction.reply(`Added **${song}**`);

      }

    }

  }
}