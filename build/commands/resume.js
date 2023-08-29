var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "discord.js", "path"], function (require, exports, discord_js_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    path_1 = __importDefault(path_1);
    exports.default = {
        data: new discord_js_1.SlashCommandBuilder()
            .setName(path_1.default.basename(__filename).replace(/\.[^/.]+$/, ""))
            .setDescription('Resume music'),
        /**
         *
         * @param interaction
         * @param music
         * @param client
         */
        exe: (interaction, music, client) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const url = interaction.options.getString('input');
            const guild = interaction.guildId;
            if (!music.data.has(guild)) {
                interaction.reply({
                    content: "Bot not in voice"
                });
            }
            else {
                const queue = music.data.get(guild);
                (_a = queue === null || queue === void 0 ? void 0 : queue.voice.player) === null || _a === void 0 ? void 0 : _a.resume();
                interaction.reply({
                    content: "Resume music success"
                });
            }
        })
    };
});
