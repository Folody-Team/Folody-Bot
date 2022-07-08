import { ApplicationCommandType, CommandInteraction } from 'discord.js';
import { Folody } from '@Folody/client/Client';
declare const _default: {
    name: string;
    description: string;
    type: ApplicationCommandType;
    options: {
        name: string;
        description: string;
        type: number;
        required: boolean;
    }[];
    init: (folody: Folody, interaction: CommandInteraction) => Promise<void>;
};
export default _default;
