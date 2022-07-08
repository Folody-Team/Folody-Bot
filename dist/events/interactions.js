"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports['interactions'] = function (folody) {
    folody.client.on('interactionCreate', (_interaction) => {
        if (_interaction.isChatInputCommand()) {
            const command = folody.commands.get(_interaction.commandName);
            if (!command)
                return;
            command.init(folody, _interaction);
        }
    });
};
//# sourceMappingURL=interactions.js.map