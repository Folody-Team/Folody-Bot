import Bot from "bot";
import { Events, Interaction } from "discord.js";
import Event from "models/event";

export default new Event({
  eventName: Events.InteractionCreate,
  run: async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = (interaction.client as Bot).commands.get(
        interaction.commandName,
      )!;
      command.run(interaction);
    }
  },
});
