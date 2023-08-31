import Bot from "bot";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Events,
  SlashCommandBuilder,
  bold,
  inlineCode,
} from "discord.js";
import { Player } from "media/player";
import Command from "models/command";
import { specialCharacters } from "modules/misc";

// /**
//  *
//  * @param url
//  * @param queue
//  * @param music
//  * @param guild
//  * @param channel
//  * @param gateway
//  */
async function playMusic(
  query: string,
  interaction: ChatInputCommandInteraction,
) {
  const bot = interaction.client as Bot;

  const stream = await bot.music.api.download(query);

  const player = new Player();

  player.play(stream);
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

    if (!interaction.inGuild()) return;
    const guildID = interaction.guildId;
    const bot = interaction.client as Bot;

    if (!bot.music.queues.get(guildID)) {
      bot.music.createQueue(guildID);
    }

    const queue = bot.music.queues.get(guildID)!;

    const gateway = bot.guilds.cache.get(guildID)?.shard;
    if (!gateway) return interaction.reply("Unknown error");

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

    gateway.send({
      op: 2 << 1,
      d: {
        guild_id: guildID,
        channel_id: (
          await interaction.guild!.members.fetch(interaction.user.id)
        ).voice.channelId,
        self_mute: false,
        self_deaf: true,
      },
    });

    console.log(queue.songs.length);

    if (queue.songs.length != 1) {
      // first song added
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
