"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordFetch = exports.DiscordVerify = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const discord_interactions_1 = require("discord-interactions");
// eslint-disable-next-line no-empty-pattern
/**
 *
 * @param id
 * @param options
 * @returns
 */
async function DiscordVerify(clientKey) {
    return function (req, res, buf, encoding) {
        const signature = req.get('X-Signature-Ed25519');
        const timestamp = req.get('X-Signature-Timestamp');
        const isValidRequest = (0, discord_interactions_1.verifyKey)(buf, signature, timestamp, clientKey);
        if (!isValidRequest) {
            res.status(401).send('Bad request signature');
            throw new Error('Bad request signature');
        }
    };
}
exports.DiscordVerify = DiscordVerify;
async function DiscordFetch(options, routes) {
    await DiscordVerify(process.env.CLIENT_KEY);
    if (options.body)
        options.body = JSON.stringify(options.body);
    const endpoint = `https://discord.com/api/v10/${routes}`;
    const res = (0, node_fetch_1.default)(endpoint, {
        headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'DiscordBot (https://folody.xyz, 1.0.0)',
        },
        ...options
    });
    if (!(await res).ok) {
        const data = await (await res).json();
        // eslint-disable-next-line no-console
        console.log((await res).status);
        throw new Error(JSON.stringify(data));
    }
    return res;
}
exports.DiscordFetch = DiscordFetch;
//# sourceMappingURL=DiscordFetch.js.map