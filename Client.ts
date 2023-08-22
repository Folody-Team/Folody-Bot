import {Client as DiscordClient, IntentsBitField} from 'discord.js';

export class Client {
  public static commandsExe = new Map();
  public static init(token: string) {
    const client = new DiscordClient({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
      ]
    })

    client.login(token)

    return client
  }
}