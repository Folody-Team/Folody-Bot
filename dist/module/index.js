"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@Folody/client");
const folody = new client_1.Folody();
folody.client.login(process.env.DISCORD_TOKEN).then(() => {
    // eslint-disable-next-line no-console
    console.log('Logged in!');
    fs_1.default.readdir(`${__dirname}/../handler`, function (err, files) {
        /**
         * @param {Client} client
         */
        if (err)
            throw err;
        files.forEach(file => {
            if (!file.endsWith('.js'))
                return;
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require(`@Folody/handler/${file}`)[file.split('.')[0]](folody);
        });
    });
});
//# sourceMappingURL=index.js.map