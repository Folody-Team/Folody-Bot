"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Core_1 = require("@Folody/function/Core");
const messages_1 = require("@Folody/messages");
exports.default = {
    name: 'skip',
    description: 'Skip commands',
    type: discord_js_1.ApplicationCommandType.ChatInput,
    init: async (folody, interaction) => {
        interaction.deferReply();
        // if member is in other voice channel
        const server = Core_1.servers.get(interaction.guildId);
        if (!server)
            return void await interaction.followUp('Please join a voice channel and try again');
        if (server.queue.length === 0)
            return void await interaction.followUp(messages_1.messages.NoSong);
        server.play();
        if (server.playing) {
            await void interaction.followUp(messages_1.messages.Skip);
        }
    },
};
//# sourceMappingURL=skip.js.map