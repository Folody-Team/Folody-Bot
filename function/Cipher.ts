import crypto from 'crypto';

export function hideData(key: string, iv: Buffer, data: string) {
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(data, 'utf-8', 'hex');

  encrypted += cipher.final('hex');

  // Auth tag must be generated after cipher.final()
  const tag = cipher.getAuthTag();

  return encrypted + "$$" + tag.toString('hex') + "$$" + iv.toString('hex');
}


export function showData(data: string, password: string) {
  const key = crypto.createHash('sha256').update(password).digest('hex').substring(0, 32);
  var cipherSplit = data.split("$$"),
    text = cipherSplit[0],
    tag = Buffer.from(cipherSplit[1], 'hex'),
    iv = Buffer.from(cipherSplit[2], 'hex'),
    decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);


  decipher.setAuthTag(tag);

  var decryptedData = decipher.update(text, 'hex', 'utf-8');

  decryptedData += decipher.final('utf-8');

  return decryptedData

}