/**
 * 애플리케이션 수준에서의 추가 암호화(Field-level Encryption)를 위한 유틸리티
 * 이메일 등 민감 정보를 DB에 저장하기 전 암호화할 때 사용합니다.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// 실제 환경에서는 AWS Secrets Manager 등에서 가져와야 합니다.
const ENCRYPTION_KEY = process.env.DB_FIELD_ENCRYPTION_KEY || 'default_secret_key_32_chars_long!!'; 
const IV_LENGTH = 16;

export const encryptPII = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decryptPII = (text: string): string => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};