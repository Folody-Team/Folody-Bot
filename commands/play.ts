import Bot from "bot";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Events,
  SlashCommandBuilder,
  WebSocketShard,
  bold,
  inlineCode,
} from "discord.js";
import { Player } from "media/player";
import Command from "models/command";
import { specialCharacters } from "modules/misc";
import { Loop } from "modules/music";

// /**
//  *
//  * @param url
//  * @param queue
//  * @param music
//  * @param guild
//  * @param channel
//  * @param gateway
//  */
function playMusic(
  query: string,
  interaction: ChatInputCommandInteraction,
  gateway: WebSocketShard,
) {
  const bot = interaction.client as Bot;
  const guildID = interaction.guildId!;
  const queue = bot.music.queues.get(guildID)!;
  bot.music.api.download(query).then((stream) => {
    const player = Player.create(stream, queue.voice.udp);
    player.once("spawnProcess", () => {
      queue.voice.setSpeaking(true);
    });

    player.on("finish", () => {
      console.log("finish");
      queue.voice.setSpeaking(false);

      if (queue.songs.length == 1 && queue.loop == Loop.Off) {
        player.stop();
        gateway.send({
          op: 4,
          d: {
            guild_id: guildID,
            channel_id: null,
            self_mute: null,
            self_deaf: null,
          },
        });
        queue.voice.shard.send(
          JSON.stringify({
            op: 4,
            d: {
              guild_id: guildID,
              channel_id: null,
              self_mute: null,
              self_deaf: null,
            },
          }),
        );
        queue.songs.splice(0, queue.songs.length);
        queue.voice.disconnect();
        bot.music.queues.delete(guildID);
      } else if (queue.songs.length > 1 && queue.loop == Loop.Off) {
        queue.songs.shift();

        playMusic(queue.songs[0].url, interaction, gateway);
      } else if (queue.loop == Loop.Queue || queue.loop == Loop.Off) {
        const lastQueueSong = queue.songs.shift();
        if (queue.loop == Loop.Queue) {
          if (lastQueueSong)
            queue.songs.push({
              ...lastQueueSong,
            });
        }

        playMusic(queue.songs[0].url, interaction, gateway);
      } else if (queue.loop == Loop.Song) {
        playMusic(queue.songs[0].url, interaction, gateway);
      } else {
        console.log(queue.loop);
      }
    });
    player.play();
  });
}

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

    if (!query.match(/^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/)) {
      return await interaction.reply("You must enter soundcloud link!");
    }

    const guildID = interaction.guildId;
    if (!guildID) return;
    const bot = interaction.client as Bot;

    if (!bot.music.queues.get(guildID)) {
      bot.music.createQueue(guildID);
    }

    const queue = bot.music.queues.get(guildID)!;

    const gateway = bot.guilds.cache.get(guildID)?.shard;
    if (!gateway) return;
    await bot.music.addSong(guildID, query);
    gateway.send({
      op: 2 << 1,
      d: {
        guild_id: guildID,
        channel_id: interaction.guildId,
        self_mute: false,
        self_deaf: true,
      },
    });

    const song = await bot.music.addSong(guildID, query);

    bot.on(Events.Raw, (packet) => {
      if (packet.t == "VOICE_STATE_UPDATE") {
        queue.voice.session(packet.d.session_id);
      }
      if (packet.t == "VOICE_SERVER_UPDATE") {
        queue.voice.init(guildID, bot.user!.id, packet.d.token);
        queue.voice.connect(`wss://${packet.d.endpoint}/?v=4`);

        playMusic(song.url, interaction, gateway);
      }
    });

    if (queue.songs.length != 0) {
      interaction.reply(`Added ${bold(inlineCode(song.info.title))}`);
      return;
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(song.info.title)
          .setDescription(
            `${
              song.info.description[0].match(specialCharacters)
                ? `\\${song.info.description}`
                : song.info.description
            }`,
          ),
      ],
    });
  },
});
