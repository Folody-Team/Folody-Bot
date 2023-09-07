import Bot from "bot";
import { SlashCommandBuilder } from "discord.js";
import Command from "models/command";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause music"),
  async run(interaction) {
    const guildID = interaction.guildId;
    if (!guildID) return;
    const bot = interaction.client as Bot;
    const queue = bot.music.queues.get(guildID);

    if (!queue) {
      interaction.reply({
        content: "Bot not in voice",
      });
      return;
    }

    queue.voice.player?.pause();
    interaction.reply({
      content: "Pause music success",
    });
  },
});
