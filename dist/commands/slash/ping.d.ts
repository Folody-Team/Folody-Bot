import { ApplicationCommandType, CommandInteraction } from 'discord.js';
import { Folody } from '@Folody/client/Client';
declare const _default: {
    name: string;
    description: string;
    type: ApplicationCommandType;
    init: (folody: Folody, interaction: CommandInteraction) => void;
};
export default _default;
