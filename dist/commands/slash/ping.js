"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
exports.default = {
    name: 'ping',
    description: 'Ping commands',
    type: discord_js_1.ApplicationCommandType.ChatInput,
    init: (folody, interaction) => {
        interaction.reply('pong');
    },
};
//# sourceMappingURL=ping.js.map