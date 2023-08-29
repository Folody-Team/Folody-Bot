"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base = exports.max_int32bit = exports.max_int16bit = void 0;
const libsodium_wrappers_1 = require("libsodium-wrappers");
exports.max_int16bit = Math.pow(2, 16) - 1;
exports.max_int32bit = Math.pow(2, 32) - 1;
class Base {
    constructor(connection, payloadType, extensionEnabled = false) {
        this._connection = connection;
        this._payloadType = payloadType;
        this._sequence = 0;
        this._timestamp = 0;
        this._mtu = 1200;
        this._extensionEnabled = extensionEnabled;
    }
    partitionDataMTUSizedChunks(data) {
        let i = 0;
        let len = data.length;
        const out = [];
        while (len > 0) {
            const size = Math.min(len, this._mtu);
            out.push(data.slice(i, i + size));
            len -= size;
            i += size;
        }
        return out;
    }
    getNewSequence() {
        this._sequence++;
        if (this._sequence > exports.max_int16bit)
            this._sequence = 0;
        return this._sequence;
    }
    incrementTimestamp(incrementBy) {
        this._timestamp += incrementBy;
        if (this._timestamp > exports.max_int32bit)
            this._timestamp = 0;
    }
    makeRtpHeader(ssrc, isLastPacket = true) {
        const packetHeader = Buffer.alloc(12);
        packetHeader[0] = (2 << 6) | ((this._extensionEnabled ? 1 : 0) << 4);
        packetHeader[1] = this._payloadType;
        if (isLastPacket)
            packetHeader[1] |= 0b10000000;
        packetHeader.writeUIntBE(this.getNewSequence(), 2, 2);
        packetHeader.writeUIntBE(this._timestamp, 4, 4);
        packetHeader.writeUIntBE(ssrc, 8, 4);
        return packetHeader;
    }
    createHeaderExtension() {
        const extensions = [{ id: 5, len: 2, val: 0 }];
        const profile = Buffer.alloc(4);
        profile[0] = 0xbe;
        profile[1] = 0xde;
        profile.writeInt16BE(extensions.length, 2); // extension count
        const extensionsData = [];
        for (let ext of extensions) {
            const data = Buffer.alloc(4);
            data[0] = (ext.id & 0b00001111) << 4;
            data[0] |= (ext.len - 1) & 0b00001111;
            data.writeUIntBE(ext.val, 1, 2);
            extensionsData.push(data);
        }
        return Buffer.concat([profile, ...extensionsData]);
    }
    encryptData(message, nonceBuffer) {
        return (0, libsodium_wrappers_1.crypto_secretbox_easy)(message, nonceBuffer, this._connection.voiceConnection.secretKey);
    }
    get connection() {
        return this._connection;
    }
    get mtu() {
        return this._mtu;
    }
}
exports.Base = Base;
