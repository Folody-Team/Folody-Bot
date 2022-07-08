"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Folody = void 0;
const discord_js_1 = require("discord.js");
class Folody {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    commands = new discord_js_1.Collection();
    /**
     * @param {Client} client
     * @param {string} token
     */
    constructor() {
        this.client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMembers,
                discord_js_1.GatewayIntentBits.GuildPresences,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.GuildVoiceStates,
                discord_js_1.GatewayIntentBits.GuildIntegrations
            ]
        });
    }
}
exports.Folody = Folody;
//# sourceMappingURL=Client.js.map