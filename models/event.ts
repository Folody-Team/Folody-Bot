import { ClientEvents } from "discord.js";

interface EventOptions<E extends keyof ClientEvents> {
  disabled?: boolean;
  eventName: E;
  once?: boolean;
  run: (...args: ClientEvents[E]) => Promise<any>;
}

export default class Event<E extends keyof ClientEvents> {
  constructor(options: EventOptions<E>) {
    this.disabled = options.disabled ?? false;
    this.eventName = options.eventName;
    this.once = options.once;
    this.run = options.run;
  }

  disabled;
  eventName;
  once?;
  run;
}
