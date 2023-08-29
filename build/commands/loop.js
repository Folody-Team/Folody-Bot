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
define(["require", "exports", "discord.js", "path", "../function/Music"], function (require, exports, discord_js_1, path_1, Music_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    path_1 = __importDefault(path_1);
    exports.default = {
        data: new discord_js_1.SlashCommandBuilder()
            .setName(path_1.default.basename(__filename).replace(/\.[^/.]+$/, ""))
            .setDescription('Loop music')
            .addStringOption(b => b
            .setName("input")
            .setRequired(true)
            .setDescription("type of input")
            .addChoices({ name: "none", value: "none" }, { name: "queue", value: "queue" }, { name: "song", value: "song" })),
        /**
         *
         * @param interaction
         * @param music
         * @param client
         * @returns
         */
        exe: (interaction, music, client) => __awaiter(void 0, void 0, void 0, function* () {
            const guild = interaction.guildId;
            const type_option = interaction.options.getString("input", true);
            if (!music.data.has(guild)) {
                interaction.reply({
                    content: "Bot not in voice"
                });
            }
            else {
                const queue = music.data.get(guild);
                switch (type_option) {
                    case "none":
                        queue.loop = Music_1.LoopType.None;
                        break;
                    case "queue":
                        queue.loop = Music_1.LoopType.Queue;
                        break;
                    case "song":
                        queue.loop = Music_1.LoopType.Song;
                        break;
                    default:
                        interaction.reply("invalid input");
                        return;
                }
                interaction.reply({
                    content: "Set Loop music success"
                });
            }
        })
    };
});
