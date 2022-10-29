import {encryptValue, decryptValue} from '../helpers/encryption.js';

/**
* If the key exists, update it. If it doesn't exist, create it
* @param key - the key to store the value under
* @param value - the value you want to store
* @returns A boolean value of true if the key/value was successfully updated
*/
export async function put(key, value) {
    try {
        //encrypt the value
        let {encryption_key, ciphertext} = await encryptValue(value);
        //go ahead and encrypt the encryption key
        let encryption_instance = await this.encryptEncryptionKey(encryption_key);

        await this.fetch.updateKeyValueData({key, ciphertext, encryption_instance});
    }
    catch(err){
        console.log({err});
    }
    return true;
}


/**
 * It fetches the encrypted data from the database, decrypts it, and returns the decrypted data
 * @param key - The key you want to retrieve the value for
 * @returns The value of the key
 */
export async function get(key) {
    try {
        let {encryption_instance, ciphertext} = await this.fetch.retrieveKeyValueData(key);

        let encryption_key = await this.decryptEncryptionKey(encryption_instance.encryption_keys[0]);
    
        //decrypt the value
        let decrypted_value = await decryptValue(ciphertext, encryption_key);
    
        //convert to object if needed
        try {decrypted_value = typeof JSON.parse(decrypted_value) === 'object' ? JSON.parse(decrypted_value) : decrypted_value;} catch(err){}
          
        return decrypted_value;
    }
    catch(err){
        console.log({err})
        throw new Error(err);
    }
}

/**
 * It returns the keys for this user in the database.
 * @param options - {limit: Int, gte: Int}
 * @returns An array of keys
 */
export async function getKeys(options) {
    try {
        if(!options) options = {limit: 50, gte: 0};
        let data = await this.fetch.retrieveAllKeys(options);
        return data;
    }
    catch(err){
        console.log({err});
        throw new Error(err);
    }
}
