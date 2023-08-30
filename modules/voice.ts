import Bot from "bot";
import { CorePlayer } from "media/player";
import Udp from "modules/udp";
import { WebSocket } from "ws";

export class VoiceConnection {
  public bot: Bot;
  public ws?: WebSocket;
  public guildId?: string;
  public userId?: string;
  public ssrc?: number;
  public ip?: string;
  public port?: number;
  public secretKey?: Uint8Array;
  public udp = new Udp(this);
  public player?: CorePlayer;

  private code = 0;
  private interval?: NodeJS.Timeout;
  private sessionId?: string;
  private missed = 0x000000;
  private token?: string;

  /**
   *
   * @param client
   */
  constructor(bot: Bot) {
    this.bot = bot;
  }

  /**
   *
   * @param interval
   */
  private hearbeat(interval: number) {
    this.interval = setInterval(() => {
      console.log("Heartbeat", interval);
      this.ws?.send(
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
    this.ws?.send(
      JSON.stringify({
        op: 0x000001,
        d: {
          protocol: "udp",
          data: {
            address: selfIP,
            port: port,
            mode: "xsalsa20_poly1305_lite",
          },
        },
      }),
    );
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
  public async connect(endpoint: string) {
    this.ws = new WebSocket(endpoint);

    while (this.ws!.readyState !== WebSocket.OPEN) {}
    console.log("Connected to voice server");

    this.ws.on("open", () => {
      this.ws?.send(
        JSON.stringify({
          op: this.code,
          d: {
            server_id: this.guildId,
            user_id: this.userId,
            session_id: this.sessionId,
            token: this.token,
          },
        }),
      );
    });

    this.ws.on("error", (error) => {
      console.log(error);
    });

    this.ws.on("close", (code, reas) => {
      clearInterval(this.interval);
      this.interval = undefined;
      this.ws = undefined;
    });

    this.ws.on("message", (raw) => {
      const { op, d } = JSON.parse(raw.toString()); // TODO: ai đó type hint ở đây sẽ khá tốt
      switch (op) {
        case 0x000002:
          this.ssrc = d.ssrc;
          this.port = d.port;
          this.ip = d.ip;
          this.udp.startKeepAlive();
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

  public disconnect() {
    this.ws?.close();
  }
  public setSpeaking(speaking: boolean) {
    // audio
    this.ws?.send(
      JSON.stringify({
        op: 5,
        d: {
          delay: 0,
          speaking: speaking ? 1 : 0,
          ssrc: this.ssrc,
        },
      }),
    );
  }
}
