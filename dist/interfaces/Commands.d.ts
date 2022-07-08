import { CommandInteraction } from 'discord.js';
import { Folody } from '@Folody/client/Client';
export interface Commands {
    name: string;
    description: string;
    type: string;
    options: string[];
    init: (folody: Folody, interaction: CommandInteraction) => void;
}
