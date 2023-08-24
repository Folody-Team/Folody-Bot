import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Client, Events, WebSocketShard } from "discord.js";
import path from "path";
import { Music } from "../function/Music";
import { VoiceConnection } from "../module/voice";
import { Player } from "../media/Player";

function musicPlay(
  url: string,
  queue: any,
  music: Music,
  guild: string,
  channel: string,
  gateway: WebSocketShard
) {
  music.api.download(url as string).then(stream => {
    const player = Player.create(stream, (queue?.voice as VoiceConnection).udp)
    player.once('spawnProcess', () => {
      queue?.voice.setSpeaking(true);
    })

    player.once('finish', () => {
      queue?.voice.setSpeaking(false);

      if (queue?.data.length == 1) {
        queue?.data.splice(0, queue?.data.length);
        queue?.voice.shard.close();
        queue?.voice.udp.break();
       
        // gateway.send({
        //   op: 2 << 1,
        //   d: {
        //     guild_id: guild,
        //     channel_id: channel,
        //     self_mute: false,
        //     self_deaf:  true,
        //   }
        // });
        music.data.delete(guild)
      } else {
        queue?.data.shift();

        musicPlay(
          queue?.data[0].url,
          queue,
          music,
          guild,
          channel,
          gateway
        );

      }
    })

    player.play();
  })
}
export default {
  data: new SlashCommandBuilder()
    .setName(path.basename(__filename).replace(/\.[^/.]+$/, ""))
    .setDescription('Play music')
    .addStringOption(option => option.setName('input').setDescription('Enter url')),
  exe: async (interaction: ChatInputCommandInteraction, music: Music, client: Client) => {
    const url = interaction.options.getString('input')
    const guild = interaction.guildId;
    const channel = interaction.guild?.members.cache.get((interaction.member as any).user.id)?.voice.channel?.id as string;
    const gateway = client.guilds.cache.get(guild as string)?.shard as WebSocketShard;
    if (!music.data.has(guild as string)) {
      music.createQueue(guild as string);
      await music.addSong(guild as string, url as string);
      const queue = music.data.get(guild as string)
      gateway.send({
        op: 2 << 1,
        d: {
          guild_id: guild,
          channel_id: channel,
          self_mute: false,
          self_deaf: true,
        }
      });

      const playing = (queue as any).data[0]

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
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(playing.info.title as string)
            .setThumbnail(playing.info.image as string)
        ]
      })
    } else {
      const song = await music.addSong(guild as string, url as string);
      const queue = music.data.get(guild as string);

      if (queue?.data.length == 0) {
        const playing = (queue as any).data[0];
        musicPlay(
          playing.url as string,
          queue, music,
          guild as string,
          channel as string,
          gateway
        );

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(playing.info.title as string)
              .setThumbnail(playing.info.image as string)
          ]
        })
      } else {
        interaction.reply(`Added ${song}`);
      }

    }

  }
}