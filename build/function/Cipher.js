var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "crypto"], function (require, exports, crypto_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showData = exports.hideData = void 0;
    crypto_1 = __importDefault(crypto_1);
    function hideData(key, iv, data) {
        const cipher = crypto_1.default.createCipheriv('aes-256-gcm', key, iv);
        let encrypted = cipher.update(data, 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        // Auth tag must be generated after cipher.final()
        const tag = cipher.getAuthTag();
        return encrypted + "$$" + tag.toString('hex') + "$$" + iv.toString('hex');
    }
    exports.hideData = hideData;
    function showData(data, password) {
        const key = crypto_1.default.createHash('sha256').update(password).digest('hex').substring(0, 32);
        var cipherSplit = data.split("$$"), text = cipherSplit[0], tag = Buffer.from(cipherSplit[1], 'hex'), iv = Buffer.from(cipherSplit[2], 'hex'), decipher = crypto_1.default.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);
        var decryptedData = decipher.update(text, 'hex', 'utf-8');
        decryptedData += decipher.final('utf-8');
        return decryptedData;
    }
    exports.showData = showData;
});
