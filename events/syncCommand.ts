import Bot from "bot";
import { Events, SlashCommandBuilder, userMention } from "discord.js";
import Event from "models/event";

export default new Event({
  eventName: Events.MessageCreate,
  once: true,
  async run(message) {
    if (
      !(process.env.Admins?.split(",") || ["487597510559531009"]).includes(
        message.author.id,
      ) ||
      message.content !== `${userMention(message.client.user.id)} deploy`
    )
      return;

    const bot = message.client as Bot;

    const commands: SlashCommandBuilder[] = [];
    bot.commands.forEach((command) => commands.push(command.data));

    bot.application?.commands.set(commands);

    message.channel.send("Đã deploy slash commands");
  },
});
