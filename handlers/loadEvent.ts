import Bot from "bot";
import { readdirSync } from "fs";
import Event from "models/event";

const EVENT_DIR = "./events/";

export default async function loadEvents(bot: Bot) {
  readdirSync(EVENT_DIR).forEach(async (file) => {
    const event = (await import(`.${EVENT_DIR}${file}`)).default as Event<any>;
    if (event.disabled) return;
    if (event.once) bot.once(event.eventName, event.run);
    else bot.on(event.eventName, event.run);
  });
}
