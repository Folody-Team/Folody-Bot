"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const path_1 = __importDefault(require("path"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName(path_1.default.basename(__filename).replace(/\.[^/.]+$/, ""))
        .setDescription('Pause music'),
    /**
     *
     * @param interaction
     * @param music
     * @param client
     * @returns
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
            if ((queue === null || queue === void 0 ? void 0 : queue.data.length) == 0) {
                return interaction.reply('Queue not found!');
            }
            (_a = queue === null || queue === void 0 ? void 0 : queue.voice.player) === null || _a === void 0 ? void 0 : _a.pause();
            interaction.reply({
                content: "Pause music success"
            });
        }
    })
};
