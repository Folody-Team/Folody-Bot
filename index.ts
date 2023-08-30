import Bot from "bot";
import { GatewayIntentBits } from "discord.js";
import "dotenv/config";
import loadEvents from "handlers/loadEvent";

const bot = new Bot({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

if (process.env.BotToken) bot.login(process.env.BotToken);
else throw new Error("Token not set");

loadEvents(bot);
