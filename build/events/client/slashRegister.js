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
const Client_1 = require("../../Client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.default = {
    name: discord_js_1.Events.ClientReady,
    mode: 'OneTime',
    /**
     *
     * @param client
     * @param player
     * @returns
     */
    exe: (client, music) => __awaiter(void 0, void 0, void 0, function* () {
        const slashFolders = fs_1.default.readdirSync(path_1.default.join(__dirname, '../../commands'));
        const commands = new Array();
        const rest = new discord_js_1.REST().setToken(client.token);
        const active = (data) => {
            const main = require(`../../commands/${data.replace(/\.[^/.]+$/, "")}`);
            commands.push(main.default.data.toJSON());
            Client_1.Client.commandsExe.set(main.default.data.name, main.default.exe);
        };
        const loop = (l, r) => {
            while (l <= r) {
                if (l === r) {
                    active(slashFolders[l]);
                }
                else {
                    active(slashFolders[l]);
                    active(slashFolders[r]);
                }
                ++l;
                --r;
            }
        };
        const mid = (l, r) => {
            if ((l + r) / 2 > 3) {
                mid(l, (slashFolders.length - 1) / 2);
                mid((slashFolders.length - 1) / 2 + 1, r);
            }
            else {
                return loop(l, r);
            }
        };
        if (slashFolders.length == 1) {
            yield active(slashFolders[0]);
        }
        else {
            yield mid(0, slashFolders.length - 1);
        }
        (() => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            try {
                console.log(`Started refreshing ${commands.length} application (/) commands.`);
                // The put method is used to fully refresh all commands in the guild with the current set
                const data = yield rest.put(discord_js_1.Routes.applicationCommands((_a = client === null || client === void 0 ? void 0 : client.application) === null || _a === void 0 ? void 0 : _a.id), { body: commands });
                console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
            }
            catch (error) {
                // And of course, make sure you catch and log any errors!
                console.error(error);
            }
        }))();
        return 0;
    })
};
