import { max_int32bit } from "core/base";
import { Packetizer } from "core/packetizer";
import { createSocket } from "dgram";
import { VoiceConnection } from "modules/voice";

const KEEP_ALIVE_INTERVAL = 5e3;
const MAX_COUNTER_VALUE = 2 ** 32 - 1;

export default class UDP {
  private port?: number;
  private ip?: string;

  private nonce = 0;
  private audioPacketizer: Packetizer = new Packetizer(this);
  private ready = false;

  private blank = Buffer.alloc(74);
  private keepAliveCounter = 0;
  private keepAliveInterval?: NodeJS.Timeout;
  private keepAliveBuffer: Buffer = Buffer.alloc(8);

  public udp = createSocket("udp4");

  constructor() {}

  public init(voiceConnection: VoiceConnection) {
    this.port = voiceConnection.port;
    this.ip = voiceConnection.ip;
  }

  public startKeepAlive() {
    this.keepAliveInterval = setInterval(this._keepAlive, KEEP_ALIVE_INTERVAL);
  }

  private _keepAlive() {
    this.keepAliveBuffer.writeUInt16LE(this.keepAliveCounter, 0);
    this.udp.send(
      this.keepAliveBuffer,
      0,
      this.keepAliveBuffer.length,
      this.port,
      this.ip,
    );
    this.keepAliveCounter++;
    if (this.keepAliveCounter > MAX_COUNTER_VALUE) {
      this.keepAliveCounter = 0;
    }
  }
  public genesis(voiceConnection: VoiceConnection) {
    this.udp.once("message", (message) => {
      if (message.readUInt16BE(0) !== 2) {
        return console.log("wrong handshake packet for udp");
      }
      const data = Buffer.from(message);
      const ip = data.subarray(8, data.indexOf(0, 8)).toString("utf-8");
      const port = data.readUint16BE(data.length - 2);
      voiceConnection.protocol(ip, port);

      setImmediate(this._keepAlive).unref();
      // Handle packer này xong thì set event cho cái kia
      this.udp.on("message", this.message);
    });

    this.udp.on("close", () => console.log("udp closed"));

    this.udp.on("error", console.error);

    this.blank.writeUInt16BE(1, 0);
    this.blank.writeUInt16BE(70, 2);
    this.blank.writeUInt32BE(voiceConnection.ssrc!, 4);

    this.udp.send(
      this.blank,
      0,
      this.blank.length,
      this.port,
      this.ip,
      (err: any, bytes: any) => {},
    );
  }

  public getNewNonceBuffer() {
    const nonceBuffer = Buffer.alloc(24);
    this.nonce++;
    if (this.nonce > max_int32bit) this.nonce = 0;
    nonceBuffer.writeUInt32BE(this.nonce, 0);
    return nonceBuffer;
  }

  public break() {
    this.ready = false;
    this.udp.disconnect();
    clearInterval(this.keepAliveInterval);

    this.keepAliveBuffer = Buffer.alloc(8);
    this.keepAliveCounter = 0;
  }

  public sendFrame(chunk: any) {
    if (!this.ready) return;
    const packet = this.audioPacketizer.createPacket(chunk);
    this.udp.send(
      packet,
      0,
      packet.length,
      this.port,
      this.ip,
      (err: any, bytes: any) => {},
    );

    this.audioPacketizer.onFrameSent();
  }

  public message(message: any) {
    console.log(message);
  }
}
