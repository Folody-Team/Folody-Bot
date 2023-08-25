import { Writable } from "stream";
import { Udp } from "../module/udp";

export class Audio extends Writable {
	udp?: Udp;
	count: number;
	sleepTime: number;
	startTime: number = 0;

	constructor(udp: Udp) {
		super();
		this.udp = udp;
		this.count = 0;
		this.sleepTime = 20;
	}

	public _write(chunk: any, encoding: any, callback: any) {
		if (!this.udp) {
			callback();
			return;
		}

		this.count++;
		if (!this.startTime) this.startTime = Date.now();

		this.udp.sendFrame(chunk);

		let next =
			(this.count + 1) * this.sleepTime - (Date.now() - this.startTime);

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
	override destroy() {
		this.udp = undefined;
		super.destroy();
	}
}
