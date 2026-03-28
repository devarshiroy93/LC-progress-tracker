import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash) {
    return false;
  }

  const hashBuffer = Buffer.from(originalHash, "hex");
  const candidateBuffer = scryptSync(password, salt, KEY_LENGTH);

  if (hashBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, candidateBuffer);
}
