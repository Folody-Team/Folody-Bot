import { Client, Events } from "discord.js";
import "dotenv/config";
import Event from "models/event";

export default new Event({
  eventName: Events.ClientReady,
  once: true,
  async run(client: Client) {
    console.log(`Logged in as ${client.user?.tag}!`);
  },
});
