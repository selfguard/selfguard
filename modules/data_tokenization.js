import { v4 as uuidv4 } from 'uuid';

/**
    * It takes a value, encrypts it, saves it to the database, and returns the id of the saved data
    * @param value - The value to be tokenized.
    * @returns The id of the tokenized value
    */
 export async function tokenize(value) {
    try {
        let {encryption_key_id, ciphertext} = await this.encrypt(value);
        let id = "tok_"+uuidv4();
        await this.fetch.saveTokenizedData({id, ciphertext, encryption_key_id});
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
    let {encryption_key_id, ciphertext} = await this.fetch.retrieveTokenizedData({id})
    let decrypted_data = await this.decrypt(ciphertext, encryption_key_id);
    return decrypted_data;
  }
  catch(err){
    console.log({err});
    throw new Error(err);
  }
}