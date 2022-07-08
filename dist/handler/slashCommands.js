"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.slashCommands = void 0;
/* eslint-disable no-var */
const fs_1 = __importDefault(require("fs"));
const index_1 = require("@Folody/function/index");
/**
 *
 * @param folody
 */
var commands = [];
async function slashCommands(folody) {
    fs_1.default.readdir(`${__dirname}/../commands/slash`, function (err, files) {
        if (err)
            throw err;
        files.forEach(file => {
            if (!file.endsWith('.js'))
                return;
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const command = require(`@Folody/commands/slash/${file}`).default;
            /**
             * @param {Client} client
             * @param {string} token
             * @param {string} command
             */
            if (command.name) {
                const newCommand = {
                    name: command.name ? command.name : file.split('.')[0],
                    description: command.description ? command.description : null,
                    type: command.type ? command.type : null,
                    options: command.options ? command.options : null,
                    init: command.init ? command.init : null,
                };
                // eslint-disable-next-line no-console
                console.log(`Loaded slash command ${newCommand.name}`);
                folody.commands.set(newCommand.name, newCommand);
                commands.push(newCommand);
            }
            else {
                // eslint-disable-next-line no-console
                console.log(`Failed to load slash command ${file}`);
            }
        });
        (0, index_1.DiscordFetch)({
            method: 'PUT',
            body: commands,
        }, `applications/${process.env.ID}/commands`);
    });
}
exports.slashCommands = slashCommands;
//# sourceMappingURL=slashCommands.js.map