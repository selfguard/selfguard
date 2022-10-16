/**
* If the key exists, update it. If it doesn't exist, create it
* @param key - the key to store the value under
* @param value - the value you want to store
* @returns A boolean value of true if the key/value was successfully updated
*/
export async function put(key, value) {
    try {
        let {encryption_key_id, ciphertext} = await this.encrypt(value);
        await this.fetch.updateKeyValueData({key, ciphertext, encryption_key_id});
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
        let {encryption_key_id, ciphertext} = await this.fetch.retrieveKeyValueData({key});
        let value = await this.decrypt(ciphertext, encryption_key_id);
        return value;
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
