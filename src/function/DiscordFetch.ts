import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';
// eslint-disable-next-line no-empty-pattern
/**
 * 
 * @param id 
 * @param options 
 * @returns 
 */
export async function DiscordVerify (clientKey: any) {
  return function (req: any, res: any, buf: any, encoding: any) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
}
export async function DiscordFetch (options: any, routes: string) {
  await DiscordVerify(process.env.CLIENT_KEY);
  if (options.body) options.body = JSON.stringify(options.body);
  const endpoint = `https://discord.com/api/v10/${routes}`;
  const res = fetch(endpoint, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'DiscordBot (https://folody.xyz, 1.0.0)',
    },
    ...options
  })
  if (!(await res).ok) {
    const data = await (await res).json();
    // eslint-disable-next-line no-console
    console.log((await res).status);
    throw new Error(JSON.stringify(data));
  }
  return res
}
