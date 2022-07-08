import { DiscordFetch } from '@Folody/function';
import { Folody } from '@Folody/client/Client';
import process from 'process';

async function disconnect (folody: Folody): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Disconnecting from Discord...');
  DiscordFetch({
    method: 'PUT',
    body: [
      {
        name: 'disconnected',
        description: 'Bot has been disconnected, please try again later',
      }
    ],
  }, `applications/${process.env.ID}/commands`);
  folody.client.destroy();
  // eslint-disable-next-line no-console
  console.log('Disconnected from Discord.');
  
}
exports['disconnect'] = function (folody: Folody) {
  process.on('SIGINT', async function() {
    // eslint-disable-next-line no-console
    await disconnect(folody);
    setTimeout(function() {
      process.exit(0);
    }, 3000);
  });
  

}