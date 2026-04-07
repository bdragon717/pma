import { getSecretKey } from "@/src/utils/keyManager";
import CryptoJS from "crypto-js";

// 암호화
export async function encrypt(text: string): Promise<string> {
  const key = await getSecretKey();
  return CryptoJS.AES.encrypt(text, key).toString();
}

// 복호화
export async function decrypt(cipher: string): Promise<string> {
  const key = await getSecretKey();
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}