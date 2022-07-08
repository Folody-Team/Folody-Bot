import fs from 'fs';
import { Folody } from '@Folody/client/Client';

/**
 * 
 * @param folody 
 */
export async function events (folody: Folody) {
  fs.readdir(`${__dirname}/../events`, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      if (!file.endsWith('.js')) return;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require(`@Folody/events/${file}`)[file.split('.')[0]](folody);
      // eslint-disable-next-line no-console
      console.log(`Loaded event ${file}`);
    });
  });
}