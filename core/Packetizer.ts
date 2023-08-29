import { Udp } from "../module/udp";
import { Base } from "./Base";

export class Packetizer extends Base {
	private magic = (47999 / 100) * 2
	constructor(connection: Udp) {
		super(connection, 0x78);
	}

	public sendFrame(frame: any): void {
		const packet = this.createPacket(frame);
		this.connection.udp.send(
			packet,
			0,
			packet.length,
			this.connection.voiceConnection.port,
			this.connection.voiceConnection.ip,
		);
		this.onFrameSent();
	}

	public createPacket(chunk: any): Buffer {
		const header = this.makeRtpHeader(this.connection.voiceConnection.ssrc as number);
		const nonceBuffer = this.connection.getNewNonceBuffer();
		return Buffer.concat([
			header,
			this.encryptData(chunk, nonceBuffer),
			nonceBuffer.subarray(0, 4),
		]);
	}

	public onFrameSent(): void {
		this.incrementTimestamp(this.magic);
	}

}