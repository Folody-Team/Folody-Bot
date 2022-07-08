"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSeconds = void 0;
const moment_1 = __importDefault(require("moment"));
const formatSeconds = (seconds) => {
    return moment_1.default
        .utc(seconds * 1000)
        .format(seconds > 3600 ? 'HH:mm:ss' : 'mm:ss');
};
exports.formatSeconds = formatSeconds;
//# sourceMappingURL=FormatTime.js.map