import Bot from "bot";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "models/command";

// /**
//  *
//  * @param url
//  * @param queue
//  * @param music
//  * @param guild
//  * @param channel
//  * @param gateway
//  */
// function musicPlay(
//   url: string,
//   queue: Queue,
//   music: Music,
//   guild: string,
//   channel: string,
//   gateway: WebSocketShard,
// ) {
//   music.api.download(url as string).then((stream) => {
//     const player = Player.create(stream, queue.voice.udp);
//     player.once("spawnProcess", () => {
//       queue?.voice.setSpeaking(true);
//     });

//     player.on("finish", () => {
//       console.log("finish");
//       queue?.voice.setSpeaking(false);

//       if (queue.data.length == 1 && queue.loop == Loop.Off) {
//         player.stop();
//         gateway.send({
//           op: 4,
//           d: {
//             guild_id: guild,
//             channel_id: null,
//             self_mute: null,
//             self_deaf: null,
//           },
//         });
//         queue.voice.shard.send(
//           JSON.stringify({
//             op: 4,
//             d: {
//               guild_id: guild,
//               channel_id: null,
//               self_mute: null,
//               self_deaf: null,
//             },
//           }),
//         );
//         queue.data.splice(0, queue.data.length);
//         queue.voice.disconnect();
//         music.queue.delete(guild);
//       } else if (queue.data.length > 1 && queue.loop == Loop.Off) {
//         queue.data.shift();

//         musicPlay(queue?.data[0].url, queue, music, guild, channel, gateway);
//       } else if (queue.loop == Loop.Queue || queue.loop == Loop.Off) {
//         const lastQueueSong = queue?.data.shift();
//         if (queue.loop == Loop.Queue) {
//           if (lastQueueSong)
//             queue.data.push({
//               ...lastQueueSong,
//             });
//         }

//         musicPlay(queue?.data[0].url, queue, music, guild, channel, gateway);
//       } else if (queue.loop == Loop.Song) {
//         musicPlay(queue?.data[0].url, queue, music, guild, channel, gateway);
//       } else {
//         console.log(queue.loop);
//       }
//     });
//     player.play();
//   });
// }
// export default {
//   data: new SlashCommandBuilder()
//     .setName(path.basename(__filename).replace(/\.[^/.]+$/, ""))
//     .setDescription("Play music")
//     .addStringOption((option) =>
//       option.setName("input").setDescription("Enter url").setRequired(true),
//     ),
//   /**
//    *
//    * @param interaction
//    * @param music
//    * @param client
//    * @returns
//    */
//   exe: async (
//     interaction: ChatInputCommandInteraction,
//     music: Music,
//     client: Client,
//   ) => {
//     const url = interaction.options.getString("input");
//     if (!url?.match(/^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/)) {
//       return await interaction.reply("You must enter soundcloud link!");
//     }
//     const guild = interaction.guildId;
//     const channel = interaction.guild?.members.cache.get(
//       (interaction.member as any).user.id,
//     )?.voice.channel?.id as string;
//     const gateway = client.guilds.cache.get(guild as string)
//       ?.shard as WebSocketShard;
//     if (!music.queue.has(guild as string)) {
//       music.createQueue(guild as string);
//       await music.addSong(guild as string, url as string);
//       const queue = music.queue.get(guild as string)!;
//       gateway.send({
//         op: 2 << 1,
//         d: {
//           guild_id: guild,
//           channel_id: channel,
//           self_mute: false,
//           self_deaf: true,
//         },
//       });

//       const playing = queue.data[0];

//       client.on(Events.Raw, (packet) => {
//         if (packet.t == "VOICE_STATE_UPDATE") {
//           queue?.voice.session(packet.d.session_id);
//         }
//         if (packet.t == "VOICE_SERVER_UPDATE") {
//           queue?.voice.init(
//             guild as string,
//             client.user?.id as string,
//             packet.d.token,
//           );
//           queue?.voice.connect(`wss://${packet.d.endpoint}/?v=4`);

//           musicPlay(
//             playing.url as string,
//             queue,
//             music,
//             guild as string,
//             channel as string,
//             gateway,
//           );
//         }
//       });

//       await interaction.reply({
//         embeds: [
//           new EmbedBuilder()
//             .setTitle(playing.info.title)
//             .setDescription(
//               `${
//                 (playing.info.description as string)[0].match(
//                   /[!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/,
//                 )
//                   ? `\\${playing.info.description}`
//                   : playing.info.description
//               }`,
//             ),
//         ],
//       });
//     } else {
//       const song = await music.addSong(guild as string, url as string);
//       const queue = music.queue.get(guild as string);

//       console.log(music.queue);
//       if (queue?.data.length == 0) {
//         // gateway.send({
//         //   op: 2 << 1,
//         //   d: {
//         //     guild_id: guild,
//         //     channel_id: channel,
//         //     self_mute: false,
//         //     self_deaf: true,
//         //   }
//         // });
//         // const playing = queue.data[0];
//         // client.on(Events.Raw, (packet) => {
//         //   if (packet.t == 'VOICE_STATE_UPDATE') {
//         //     queue?.voice.session(packet.d.session_id)
//         //   }
//         //   if (packet.t == 'VOICE_SERVER_UPDATE') {
//         //     queue?.voice.init(guild as string, client.user?.id as string, packet.d.token)
//         //     queue?.voice.connect(`wss://${packet.d.endpoint}/?v=4`)
//         //     musicPlay(
//         //       playing.url as string,
//         //       queue, music,
//         //       guild as string,
//         //       channel as string,
//         //       gateway
//         //     );
//         //   }
//         // })
//         // await interaction.reply({
//         //   embeds: [
//         //     new EmbedBuilder()
//         //       .setTitle(playing.info.title)
//         //       .setDescription(`${(playing.info.description as string)[0].match(/[!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/) ? `\\${playing.info.description}` : playing.info.description}`)
//         //   ]
//         // })
//       } else {
//         await interaction.reply(`Added **${song}**`);
//       }
//     }
//   },
// };

const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play music");

data.addStringOption((option) =>
  option
    .setName("query")
    .setDescription("Enter song name or url")
    .setRequired(true),
);

export default new Command({
  data,
  async run(interaction) {
    const query = interaction.options.getString("query", true);
    const guildID = interaction.guildId;
    if (!guildID) return;
    const bot = interaction.client as Bot;
    const queue = bot.music.queues.get(guildID);

    if (!queue) {
      await bot.music.createQueue(guildID);
      await bot.music.addSong(guildID, query);
      const queue = bot.music.queues.get(guildID)!;
      const playing = queue.data[0];

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(playing.info.title)
            .setDescription(
              `${
                (playing.info.description as string)[0].match(
                  /[!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/,
                )
                  ? `\\${playing.info.description}`
                  : playing.info.description
              }`,
            ),
        ],
      });
    } else {
      const song = await bot.music.addSong(guildID, query);
      if (queue.data.length == 0) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(song?.info.title as string)
              .setDescription(
                `${
                  (song?.info.description as string)[0].match(
                    /[!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/,
                  )
                    ? `\\${song?.info.description}`
                    : song?.info.description
                }`,
              ),
          ],
        });
      } else {
        await interaction.reply(`Added **${song}**`);
      }
    }
  },
});
