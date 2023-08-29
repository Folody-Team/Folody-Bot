"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Packetizer = void 0;
const Base_1 = require("./Base");
class Packetizer extends Base_1.Base {
    constructor(connection) {
        super(connection, 0x78);
        this.magic = (47999 / 100) * 2;
    }
    sendFrame(frame) {
        const packet = this.createPacket(frame);
        this.connection.udp.send(packet, 0, packet.length, this.connection.voiceConnection.port, this.connection.voiceConnection.ip);
        this.onFrameSent();
    }
    createPacket(chunk) {
        const header = this.makeRtpHeader(this.connection.voiceConnection.ssrc);
        const nonceBuffer = this.connection.getNewNonceBuffer();
        return Buffer.concat([
            header,
            this.encryptData(chunk, nonceBuffer),
            nonceBuffer.subarray(0, 4),
        ]);
    }
    onFrameSent() {
        this.incrementTimestamp(this.magic);
    }
}
exports.Packetizer = Packetizer;
