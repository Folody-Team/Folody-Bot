"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("@Folody/function");
const process_1 = __importDefault(require("process"));
async function disconnect(folody) {
    // eslint-disable-next-line no-console
    console.log('Disconnecting from Discord...');
    (0, function_1.DiscordFetch)({
        method: 'PUT',
        body: [
            {
                name: 'disconnected',
                description: 'Bot has been disconnected, please try again later',
            }
        ],
    }, `applications/${process_1.default.env.ID}/commands`);
    folody.client.destroy();
    // eslint-disable-next-line no-console
    console.log('Disconnected from Discord.');
}
exports['disconnect'] = function (folody) {
    process_1.default.on('SIGINT', async function () {
        // eslint-disable-next-line no-console
        await disconnect(folody);
        setTimeout(function () {
            process_1.default.exit(0);
        }, 3000);
    });
};
//# sourceMappingURL=disconnect.js.map