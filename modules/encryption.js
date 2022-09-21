import {encryptValue, decryptValue} from '../helpers/encryption.js';
import ee from 'easy-encryption';

/**
   * It encrypts a value and returns the encryption key id and the ciphertext.
   * @param value - The value you want to encrypt.
   * @returns The encryption key and the ciphertext
   */
 export async function encrypt(value){
    try {
        //if the value is an object, convert it to a string
        if(typeof value === "object") value = JSON.stringify(value);

        let {encryption_key, ciphertext} = await encryptValue(value);
        let encryption_key_id = await this.fetch.saveEncryptionKey(encryption_key);
        return {encryption_key_id, ciphertext};
    }
    catch(err){
        console.log({err});
        throw new Error(err);
    }
}

 
 /**
  * It encrypts the value with the password.
  * @param value - The value to be encrypted
  * @param password - The password to use for encryption.
  * @returns The encrypted value
  */
export function encryptWithPassword(value, password){
    try {
        //if the value is an object, convert it to a string
        if(typeof value === "object") value = JSON.stringify(value);
        return ee.encrypt(password, value);
    }
    catch(err){
        console.log({err});
        throw new Error(err);
    }
}

/**
   * It downloads the encryption key from the SelfGuard KMS service, then uses that key to decrypt the value
   * @param value - The encrypted value you want to decrypt.
   * @param encryption_key_id - The ID of the encryption key you want to use to decrypt the value.
   * @returns The decrypted text.
   */
export async function decrypt(value, encryption_key_id){
    try {
      let encryption_key = await this.fetch.retrieveEncryptionKey(encryption_key_id);
      let decrypted_value = await decryptValue(value, encryption_key);

      //convert to object if needed
      try {
        decrypted_value = typeof JSON.parse(decrypted_value) === 'object' ? JSON.parse(decrypted_value) : decrypted_value;
      } catch(err){}

      return decrypted_value;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
}

  /**
   * It decrypts the text with the password.
   * @param text - The text to be encrypted or decrypted.
   * @param password - The password used to encrypt the text.
   * @returns The decrypted text.
   */
export function decryptWithPassword(value, password){
    try {
      let decrypted_value = ee.decrypt(password, value);

      //convert to object if needed
      try {
        decrypted_value = typeof JSON.parse(decrypted_value) === 'object' ? JSON.parse(decrypted_value) : decrypted_value;
      } catch(err){}
      return decrypted_value;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
}