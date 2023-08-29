define(["require", "exports", "discord.js"], function (require, exports, discord_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Client = void 0;
    class Client {
        static init(token) {
            const client = new discord_js_1.Client({
                intents: [
                    discord_js_1.IntentsBitField.Flags.Guilds,
                    discord_js_1.IntentsBitField.Flags.GuildVoiceStates,
                    discord_js_1.IntentsBitField.Flags.GuildMembers,
                    discord_js_1.IntentsBitField.Flags.GuildMessages,
                ]
            });
            client.login(token);
            return client;
        }
    }
    exports.Client = Client;
    Client.commandsExe = new Map();
});