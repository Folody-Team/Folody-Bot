import 'dotenv/config';
import fs from 'fs';
import { Folody } from '@Folody/client';

const folody = new Folody();

folody.client.login(process.env.DISCORD_TOKEN).then(() => {
  // eslint-disable-next-line no-console
  console.log('Logged in!');
  fs.readdir(`${__dirname}/../handler`, function(err, files) {
    /**
     * @param {Client} client
     */
    if (err) throw err;
    files.forEach(file => {
      if (!file.endsWith('.js')) return;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require(`@Folody/handler/${file}`)[file.split('.')[0]](folody);
    });
  });
});