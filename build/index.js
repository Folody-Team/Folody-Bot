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
exports.client = void 0;
require("dotenv/config");
const fs_1 = __importDefault(require("fs"));
const Music_1 = require("./function/Music");
const Client_1 = require("./Client");
const path_1 = __importDefault(require("path"));
exports.client = Client_1.Client.init(process.env.TOKEN);
(() => __awaiter(void 0, void 0, void 0, function* () {
    const music = new Music_1.Music(exports.client);
    const clientDirSetup = path_1.default.join(__dirname, './events/client');
    const clientEventDirs = fs_1.default.readdirSync(clientDirSetup).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    for (const clientEventDir of clientEventDirs) {
        const events = require(path_1.default.join(clientDirSetup, clientEventDir));
        yield exports.client[events.default.mode == 'OneTime' ? 'once' : 'on'](events.default.name, (arg) => events.default.exe(arg, music, exports.client));
    }
}))();
