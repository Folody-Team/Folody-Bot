import { Commands } from '@Folody/interfaces/Commands';
import { Client, Collection, GatewayIntentBits } from 'discord.js';

export class Folody {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: Client;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public commands: Collection<string, Commands>  = new Collection();
  /**
   * @param {Client} client
   * @param {string} token
   */
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildIntegrations
      ]
    });
  }
}