import CryptoJS from "crypto-js";

export const encryptMessage = (message: string, key: string): string => {
  try {
    const cipherText = CryptoJS.AES.encrypt(message, key).toString();
    if (cipherText.includes("/")) {
      return cipherText.replace(/\//g, "_");
    }
    return cipherText;
  } catch (error) {
    console.error("Encryption Error", error);
    throw error;
  }
};

export const decryptMessage = (cipher: string, key: string): string => {
  try {
    if (cipher.includes("_")) {
      const bytes = CryptoJS.AES.decrypt(cipher.replace(/_/g, "/"), key);
      return bytes.toString(CryptoJS.enc.Utf8);
    }
    const bytes = CryptoJS.AES.decrypt(cipher, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption Error", error);
    throw error;
  }
};
