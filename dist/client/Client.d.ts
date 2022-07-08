import { Commands } from '@Folody/interfaces/Commands';
import { Client, Collection } from 'discord.js';
export declare class Folody {
    client: Client;
    commands: Collection<string, Commands>;
    /**
     * @param {Client} client
     * @param {string} token
     */
    constructor();
}
