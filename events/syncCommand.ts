import Bot from "bot";
import { Events, SlashCommandBuilder } from "discord.js";
import Event from "models/event";

export default new Event({
  eventName: Events.ClientReady,
  once: true,
  async run(client) {
    const bot = client as Bot;

    const commands: SlashCommandBuilder[] = [];
    bot.commands.forEach((command) => commands.push(command.data));

    bot.application?.commands.set(commands);

    console.log("Đã deploy slash commands");
  },
});
