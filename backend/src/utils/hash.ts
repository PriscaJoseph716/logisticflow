import bcrypt from "bcrypt";
import { env } from "../config/env.js";

export async function hashValue(value: string) {
  return bcrypt.hash(value, env.BCRYPT_SALT_ROUNDS);
}

export async function compareHash(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}
