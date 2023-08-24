import { Writable } from "stream";
import { Udp } from "../module/udp";

export class Audio extends Writable {
	udp?: Udp;
	count: number;
	sleepTime: number;
	startTime: number = 0;
	inQueueData: any[] = []
	isPause: boolean = false

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

		if (!this.isPause) {
			this.udp.sendFrame(chunk);
		} else {
			this.inQueueData.push(chunk)
		}

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

	public pause(pause: boolean) {
		if (pause) {
			this.isPause = pause
		} else {
			// pause is false
			if (pause != this.isPause) {
				// pause is true but this.pause is false
				while (true) {
					const i = this.inQueueData.shift()
					if (!i) return
					// push to discord
					if (!this.udp) return;
					this.udp.sendFrame(i)
				}
			}
		}
	}
	// @ts-ignore
	override destroy() {
		this.udp = undefined;
		super.destroy();
	}
}
