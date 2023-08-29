"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceConnection = void 0;
const ws_1 = require("ws");
const udp_1 = require("./udp");
class VoiceConnection {
    /**
     *
     * @param client
     */
    constructor(client) {
        this.udp = new udp_1.Udp(this);
        this.code = 0;
        this.missed = 0x000000;
        this.client = client;
    }
    /**
     *
     * @param interval
     */
    hearbeat(interval) {
        this.interval = setInterval(() => {
            console.log('Heartbeat', interval);
            this.shard.send(JSON.stringify({
                op: 0x000003,
                d: Date.now(),
            }));
        }, interval).unref();
    }
    /**
     *
     * @param value
     */
    session(value) {
        this.sessionId = value;
    }
    /**
     *
     * @param guildId
     * @param userId
     * @param token
     */
    init(guildId, userId, token) {
        this.guildId = guildId;
        this.userId = userId;
        this.token = token;
    }
    /**
     *
     * @param selfIP
     * @param port
     */
    protocol(selfIP, port) {
        this.shard.send(JSON.stringify({
            op: 0x000001,
            d: {
                protocol: 'udp',
                data: {
                    address: selfIP,
                    port: port,
                    mode: 'xsalsa20_poly1305_lite',
                },
            }
        }));
    }
    secret(key) {
        this.secretKey = new Uint8Array(key);
        if (this.udp) {
            this.udp.ready = true;
        }
    }
    /**
     *
     * @param endpoint
     */
    connect(endpoint) {
        this.shard = new ws_1.WebSocket(endpoint);
        this.shard.on('open', () => {
            this.shard.send(JSON.stringify({
                op: this.code,
                d: {
                    server_id: this.guildId,
                    user_id: this.userId,
                    session_id: this.sessionId,
                    token: this.token,
                }
            }));
        });
        this.shard.on('error', (error) => {
            console.log(error);
        });
        this.shard.on('close', (code, reas) => {
            clearInterval(this.interval);
            this.interval = undefined;
        });
        this.shard.on('message', (raw) => {
            const { op, d } = JSON.parse(raw);
            switch (op) {
                case 0x000002:
                    this.ssrc = d.ssrc;
                    this.port = d.port;
                    this.ip = d.ip;
                    this.udp.genesis();
                    break;
                case 0x000008:
                    this.hearbeat(d.heartbeat_interval);
                    break;
                case 0x000004:
                    this.secret(d.secret_key);
                    break;
                case 0x000006:
                    break;
            }
        });
    }
    setSpeaking(speaking) {
        // audio
        this.shard.send(JSON.stringify({
            op: 5,
            d: {
                delay: 0,
                speaking: speaking ? 1 : 0,
                ssrc: this.ssrc,
            }
        }));
    }
}
exports.VoiceConnection = VoiceConnection;
