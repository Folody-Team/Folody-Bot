import { Client } from "discord.js";
import { WebSocket } from 'ws'
import { Udp } from "./udp";
import { CorePlayer } from "../media/Player";

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
  public player?: CorePlayer

  private code: number = 0;
  private interval: string | number | NodeJS.Timeout | undefined;
  private sessionId: string | undefined;
  private missed = 0x000000;
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
    this.interval = setInterval(() => {
      console.log('Heartbeat', interval);
      this.shard.send(
        JSON.stringify({
          op: 0x000003,
          d: Date.now(),
        }),
      );
    }, interval).unref();
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
    this.secretKey = new Uint8Array(key);
    if (this.udp) {
      this.udp.ready = true;
    }
  }

  /**
   * 
   * @param endpoint 
   */
  public connect(endpoint: string) {
    this.shard = new WebSocket(endpoint);

    this.shard.on('open', () => {
      this.shard.send(JSON.stringify({
        op: this.code,
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
      clearInterval(this.interval);
      this.interval = undefined;
    });


    this.shard.on('message', (raw) => {
      const { op, d } = JSON.parse(raw as unknown as string);
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

    })

  }

  public disconnect() {
    this.shard.close();
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