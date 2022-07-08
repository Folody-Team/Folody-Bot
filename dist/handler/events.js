"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = void 0;
const fs_1 = __importDefault(require("fs"));
/**
 *
 * @param folody
 */
async function events(folody) {
    fs_1.default.readdir(`${__dirname}/../events`, (err, files) => {
        if (err)
            throw err;
        files.forEach(file => {
            if (!file.endsWith('.js'))
                return;
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require(`@Folody/events/${file}`)[file.split('.')[0]](folody);
            // eslint-disable-next-line no-console
            console.log(`Loaded event ${file}`);
        });
    });
}
exports.events = events;
//# sourceMappingURL=events.js.map