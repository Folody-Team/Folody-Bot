import * as sodium from "libsodium-wrappers";
import Udp from "modules/udp";

export const max_int16bit = 2 ** 16 - 1;
export const max_int32bit = 2 ** 32 - 1;

export default class Base {
  private _payloadType: number;
  private _mtu: number;
  private _sequence: number;
  private _timestamp: number;
  private _connection: Udp;
  private _extensionEnabled: boolean;

  constructor(connection: Udp, payloadType: number, extensionEnabled = false) {
    this._connection = connection;
    this._payloadType = payloadType;
    this._sequence = 0;
    this._timestamp = 0;
    this._mtu = 1200;
    this._extensionEnabled = extensionEnabled;
  }

  public partitionDataMTUSizedChunks(data: any): any[] {
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

  public getNewSequence(): number {
    this._sequence++;
    if (this._sequence > max_int16bit) this._sequence = 0;
    return this._sequence;
  }

  public incrementTimestamp(incrementBy: number): void {
    this._timestamp += incrementBy;
    if (this._timestamp > max_int32bit) this._timestamp = 0;
  }

  public makeRtpHeader(ssrc: number, isLastPacket: boolean = true): Buffer {
    const packetHeader = Buffer.alloc(12);

    packetHeader[0] = (2 << 6) | ((this._extensionEnabled ? 1 : 0) << 4);
    packetHeader[1] = this._payloadType;
    if (isLastPacket) packetHeader[1] |= 0b10000000;

    packetHeader.writeUIntBE(this.getNewSequence(), 2, 2);
    packetHeader.writeUIntBE(this._timestamp, 4, 4);
    packetHeader.writeUIntBE(ssrc, 8, 4);
    return packetHeader;
  }

  public createHeaderExtension(): Buffer {
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

  public encryptData(
    message: string | Uint8Array,
    nonceBuffer: Buffer,
  ): Uint8Array {
    return sodium.crypto_secretbox_easy(
      message,
      nonceBuffer,
      this._connection.voiceConnection.secretKey,
    );
  }

  public get connection(): Udp {
    return this._connection;
  }

  public get mtu(): number {
    return this._mtu;
  }
}
