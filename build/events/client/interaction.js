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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Client_1 = require("../../Client");
exports.default = {
    name: discord_js_1.Events.InteractionCreate,
    mode: '',
    /**
     *
     * @param client
     * @param player
     * @returns
     */
    exe: (interaction, music, client) => __awaiter(void 0, void 0, void 0, function* () {
        if (interaction.isChatInputCommand()) {
            const command = Client_1.Client.commandsExe.get(interaction.commandName);
            command(interaction, music, client);
        }
        return 0;
    })
};
