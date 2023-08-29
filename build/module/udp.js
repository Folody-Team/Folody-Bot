"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Udp = void 0;
const dgram_1 = require("dgram");
const Base_1 = require("../core/Base");
const Packetizer_1 = require("../core/Packetizer");
const KEEP_ALIVE_INTERVAL = 5e3;
const MAX_COUNTER_VALUE = Math.pow(2, 32) - 1;
class Udp {
    /**
     *
     * @param voiceConnection
     */
    constructor(voiceConnection) {
        this.ready = false;
        this.blank = Buffer.alloc(74);
        this.keepAliveCounter = 0;
        this.udp = (0, dgram_1.createSocket)('udp4');
        this.voiceConnection = voiceConnection;
        this.audioPacketizer = new Packetizer_1.Packetizer(this);
        this.keepAliveBuffer = Buffer.alloc(8);
        this.keepAliveInterval = setInterval(() => this.keepAlive(), KEEP_ALIVE_INTERVAL);
    }
    keepAlive() {
        this.keepAliveBuffer.writeUInt16LE(this.keepAliveCounter, 0);
        this.udp.send(this.keepAliveBuffer, 0, this.keepAliveBuffer.length, this.voiceConnection.port, this.voiceConnection.ip);
        this.keepAliveCounter++;
        if (this.keepAliveCounter > MAX_COUNTER_VALUE) {
            this.keepAliveCounter = 0;
        }
    }
    genesis() {
        this.udp.once('message', (message) => {
            if (message.readUInt16BE(0) !== 2) {
                return console.log('wrong handshake packet for udp');
            }
            const data = Buffer.from(message);
            const ip = data.subarray(8, data.indexOf(0, 8)).toString('utf-8');
            const port = data.readUint16BE(data.length - 2);
            this.voiceConnection.protocol(ip, port);
            setImmediate(() => this.keepAlive()).unref();
            // Handle packer này xong thì set event cho cái kia
            this.udp.on('message', this.message);
        });
        this.udp.on('close', () => {
            console.log('udp closed');
        });
        this.udp.on('error', (error) => {
            console.log(error);
        });
        this.blank.writeUInt16BE(1, 0);
        this.blank.writeUInt16BE(70, 2);
        this.blank.writeUInt32BE(this.voiceConnection.ssrc, 4);
        this.udp.send(this.blank, 0, this.blank.length, this.voiceConnection.port, this.voiceConnection.ip, (err, bytes) => {
        });
    }
    getNewNonceBuffer() {
        const nonceBuffer = Buffer.alloc(24);
        this.nonce++;
        if (this.nonce > Base_1.max_int32bit)
            this.nonce = 0;
        nonceBuffer.writeUInt32BE(this.nonce, 0);
        return nonceBuffer;
    }
    break() {
        this.ready = false;
        this.udp.close();
        clearInterval(this.keepAliveInterval);
        this.keepAliveBuffer = Buffer.alloc(8);
        this.keepAliveCounter = 0;
    }
    sendFrame(chunk) {
        if (!this.ready)
            return;
        const packet = this.audioPacketizer.createPacket(chunk);
        this.udp.send(packet, 0, packet.length, this.voiceConnection.port, this.voiceConnection.ip, (err, bytes) => {
        });
        this.audioPacketizer.onFrameSent();
    }
    message(message) {
        // console.log(message)
    }
}
exports.Udp = Udp;
