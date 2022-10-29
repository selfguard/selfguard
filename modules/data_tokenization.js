import { v4 as uuidv4 } from 'uuid';
import {encryptValue, decryptValue} from '../helpers/encryption.js';

/**
    * It takes a value, encrypts it, saves it to the database, and returns the id of the saved data
    * @param value - The value to be tokenized.
    * @returns The id of the tokenized value
    */
 export async function tokenize(value) {
    try {
        let id = "tok_"+uuidv4();

        //encrypt the value
        let {encryption_key, ciphertext} = await encryptValue(value);

        //go ahead and encrypt the encryption key
        let encryption_instance = await this.encryptEncryptionKey(encryption_key);

        await this.fetch.saveTokenizedData({id, ciphertext, encryption_instance});
        return id;
    }
    catch(err){
        console.log({err});
        throw new Error(err);
    }
}

/**
 * It takes a token id and returns the decrypted data.
 * @param id - The id of the tokenized data you want to retrieve.
 * @returns The decrypted data is being returned.
 */
export async function detokenize(id) {
  try {
    let {encryption_instance, ciphertext} = await this.fetch.retrieveTokenizedData(id)

    let encryption_key = await this.decryptEncryptionKey(encryption_instance.encryption_keys[0]);

    //decrypt the value
    let decrypted_value = await decryptValue(ciphertext, encryption_key);

    //convert to object if needed
    try {decrypted_value = typeof JSON.parse(decrypted_value) === 'object' ? JSON.parse(decrypted_value) : decrypted_value;} catch(err){}
          
    return decrypted_value;
  }
  catch(err){
    console.log({err});
    throw new Error(err);
  }
}