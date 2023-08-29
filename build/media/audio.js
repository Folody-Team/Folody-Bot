"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Audio = void 0;
const stream_1 = require("stream");
class Audio extends stream_1.Writable {
    constructor(udp) {
        super();
        this.startTime = 0;
        this.udp = udp;
        this.count = 0;
        this.sleepTime = 20;
    }
    _write(chunk, encoding, callback) {
        if (!this.udp) {
            callback();
            return;
        }
        this.count++;
        if (!this.startTime)
            this.startTime = Date.now();
        this.udp.sendFrame(chunk);
        let next = (this.count + 1) * this.sleepTime - (Date.now() - this.startTime);
        if (next < 0) {
            this.count = 0;
            this.startTime = Date.now();
            next =
                (this.count + 1) * this.sleepTime -
                    (Date.now() - this.startTime);
        }
        setTimeout(() => {
            callback();
        }, next);
    }
    // @ts-ignore
    destroy() {
        this.udp = undefined;
        super.destroy();
    }
}
exports.Audio = Audio;
