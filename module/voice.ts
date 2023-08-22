import { Client } from "discord.js";
import { WebSocket } from 'ws'
import { Udp } from "./udp";

export class VoiceConnection {
  public client: Client;
  public shard!: WebSocket;
  public guildId!: string;
  public userId!: string;
  public ssrc!: number;
  public ip!: string;
  public port!: number;
  public secretKey!: Uint8Array;
  public udp = new Udp(this);

  private interval: string | number | NodeJS.Timeout | undefined;
  private sessionId: string | undefined;
  private missed = 0;
  private token!: string;

  /**
   * 
   * @param client 
   */
  constructor(client: Client) {
    this.client = client;
  }

  /**
   * 
   * @param interval 
   */
  private hearbeat(interval: number) {
    if(this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }

    
    if(interval > 0) {
      this.interval = setInterval(() => {
        if (this.missed >=  0x000003) {
					this.shard.close();
          this.udp.udp.disconnect();
					this.hearbeat(-1);
				}

        this.missed++
        this.shard.send(JSON.stringify({
          op: 0x000003,
          d: Date.now()
        }))
      }, interval).unref()
    }
   
  }

  /**
   * 
   * @param value 
   */
  public session(value: string) {
    this.sessionId = value;
  }

  /**
   * 
   * @param guildId 
   * @param userId 
   * @param token 
   */
  public init(guildId: string, userId: string, token: string) {
    this.guildId = guildId;
    this.userId = userId;
    this.token = token;
  }

  /**
   * 
   * @param selfIP 
   * @param port 
   */
  public protocol(selfIP: string, port: number) {
    console.log(selfIP, port)
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
    }))
  }
  private secret(key: Uint8Array) {
    this.secretKey = new Uint8Array(key)
  }

  /**
   * 
   * @param endpoint 
   */
  public connect(endpoint: string) {
    this.shard = new WebSocket(endpoint);

    this.shard.on('open', () => {
      this.shard.send(JSON.stringify({
        op: 0x000000,
        d: {
          server_id: this.guildId,
          user_id: this.userId,
          session_id: this.sessionId,
          token: this.token,
        }
      }))
    })

    this.shard.on('error', (error) => {
      console.log(error);
    })

    this.shard.on('close', (code, reas) => {
      console.log(`${code}: ${reas}`);
    });
    

    this.shard.on('message', (raw) => {
      const { op, d } = JSON.parse(raw as unknown as string);

      console.log(d)
      switch(op) {
        case 0x000002 << 0:
         this.ssrc = d.ssrc;
         this.port = d.port;
         this.ip = d.ip;

        this.udp.genesis();
        case 0x000002 << 2:
          this.hearbeat(d.heartbeat_interval);
        case 0x000002 << 1:
          this.secret(d.secret_key);
        case 0x000003 << 1:
          break;
      }

    })
  }

  public setSpeaking(speaking: boolean) {
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