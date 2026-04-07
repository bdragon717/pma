import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const KEY_NAME = "SQLITE_AES_KEY";

export async function getSecretKey(): Promise<string> {
  // key 획득
  let key = await SecureStore.getItemAsync(KEY_NAME);

  // 없으면 새로 생성
  if ( ! key) {
    key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Math.random().toString()
    );
    await SecureStore.setItemAsync(KEY_NAME, key);
  }

  return key;
}