import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

interface CommandOptions {
  disabled?: boolean;
  data: SlashCommandBuilder;
  run: (interaction: ChatInputCommandInteraction) => Promise<any>;
}

export default class Command {
  constructor(options: CommandOptions) {
    this.disabled = options.disabled ?? false;
    this.data = options.data;
    this.run = options.run;
  }

  disabled;
  data;
  run;
}
