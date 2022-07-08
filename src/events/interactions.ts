import { Interaction, Message } from 'discord.js';
import { Folody } from '@Folody/client/Client';
exports['interactions'] = function (folody: Folody) {
  folody.client.on('interactionCreate',  (_interaction: Interaction) => {
    if (_interaction.isChatInputCommand()) {
      const command = folody.commands.get(_interaction.commandName);
      if (!command) return;
      command.init(folody, _interaction);
    }
  });
}