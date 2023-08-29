var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "discord.js", "dotenv/config"], function (require, exports, discord_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        name: discord_js_1.Events.ClientReady,
        mode: '',
        /**
         *
         * @param client
         * @param player
         * @returns
         */
        exe: (client, music) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (((_a = client.application) === null || _a === void 0 ? void 0 : _a.id) != process.env.Verify) {
                client.destroy();
            }
            return 0;
        })
    };
});
