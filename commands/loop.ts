import Bot from "bot";
import { SlashCommandBuilder } from "discord.js";
import Command from "models/command";
import { Loop } from "modules/music";

const data = new SlashCommandBuilder()
  .setName("loop")
  .setDescription("Loop music");

data.addStringOption((option) =>
  option
    .setName("mode")
    .setRequired(true)
    .setDescription("Loop mode")
    .addChoices(
      { name: "none", value: "none" },
      { name: "queue", value: "queue" },
      { name: "song", value: "song" },
    ),
);

export default new Command({
  data,
  async run(interaction) {
    const guildID = interaction.guildId;
    if (!guildID) return;
    const mode = interaction.options.getString("mode", true);
    const bot = interaction.client as Bot;
    const queue = bot.music.queues.get(guildID);

    if (!queue) {
      interaction.reply({
        content: "Bot not in voice",
      });
      return;
    }

    switch (mode) {
      case "none":
        queue.loop = Loop.Off;
        break;
      case "queue":
        queue.loop = Loop.Queue;
        break;
      case "song":
        queue.loop = Loop.Song;
        break;
      default:
        interaction.reply("invalid input");
        return;
    }

    interaction.reply({
      content: `Set loop to ${mode} success`,
    });
  },
});
