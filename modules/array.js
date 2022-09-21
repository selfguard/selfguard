import { v4 as uuidv4 } from "uuid";
import QuickEncrypt from "quick-encrypt";

/**
 * It creates a new array, and then creates an underlying encryption key for the array.
 * @param name - the name of the array
 * @returns A boolean value of true if the array gets created
 */
export async function initArray(name) {
  try {
    // create array
    await this.fetch.initArray({ name });

    //create underlying encryption key for array
    let encryption_key = uuidv4();

    //if public key is set, then asymmetrically encrypt the encryption key
    if (this.pub_key)
      encryption_key = QuickEncrypt.encrypt(encryption_key, this.pub_key);

    //save encryption key
    await this.fetch.saveArrayEncryptionKey({
      name,
      user_pub_key: this.pub_key,
      encryption_key,
    });
    return true;
  } catch (err) {
    console.log({ err });
    throw new Error(err);
  }
}

/**
 * This function adds a user to an array by encrypting the array's encryption key with the user's
 * public key
 * @param name - the name of the array
 * @param user_pub_key - The public key of the user you want to add to the array.
 * @returns A boolean value of true if the user was added
 */
export async function addUserToArray(name, user_pub_key) {
  try {
    //get encryption key
    let encryption_key = await this.getMyEncryptionKeyForArray(name);

    //asymmetrically encrypt the key for the user_pub_key
    encryption_key = QuickEncrypt.encrypt(encryption_key, user_pub_key);

    //save the encryption key
    await this.fetch.saveArrayEncryptionKey({
      name,
      user_pub_key,
      encryption_key,
    });
    return true;
  } catch (err) {
    console.log({ err });
    throw new Error(err);
  }
}

/**
 * It takes a name and a value, gets the encryption key for that array, encrypts the value, and saves
 * it
 * @param name - The name of the array you want to add to.
 * @param value - The value you want to save.
 * @returns A boolean value of true if the value was saved.
 */
export async function addToArray(name, value) {
  try {
    //get encryption key
    let encryption_key = await this.getMyEncryptionKeyForArray(name);

    //encrypt the data
    let ciphertext = this.encryptWithPassword(value, encryption_key);

    //save the value
    await this.fetch.saveArrayValue({ name, ciphertext });
    return true;
  } catch (err) {
    console.log({ err });
    throw new Error(err);
  }
}

/**
 * It gets the encryption key for the array, fetches the encrypted values in the array, decrypts each
 * value in the array, and returns the decrypted array
 * @param name - the name of the array
 * @param gte - This is the index of the array you want to start at.
 * @param limit - the number of items to return
 * @returns An array of objects.
 */
export async function getArray(name, gte, limit) {
  try {
    // get the encryption key
    let encryption_key = await this.getMyEncryptionKeyForArray(name);

    // fetch the values in the array
    let data = await this.fetch.getArrayValues({ name, limit, gte });

    //decrypt each value in the array
    return data.map((a) => {
      return this.decryptWithPassword(a.ciphertext, encryption_key);
    });
  } catch (err) {
    console.log({ err });
    throw new Error(err);
  }
}

/**
 * It returns all the names of the arrays saved with the respective API Key
 * @returns An array of objects.
 */
export async function getArrayNames() {
  try {
    let data = await this.fetch.getArrayNames();
    return data;
  } catch (err) {
    console.log({ err });
    throw new Error(err);
  }
}

/**
 * It gets the encryption key for an array, and if it's asymmetrically encrypted, it decrypts it
 * @param name - the name of the array you want to get the encryption key for
 * @returns The encryption key for the array.
 */
export async function getMyEncryptionKeyForArray(name) {
  try {
    // get the encryption key
    let encryption_keys = await this.fetch.getArrayEncryptionKeys({ name });

    //filter it for the encryption key respective to my public key or an
    //encryption key that is not asymmetrically encrypted
    let encryption_object = encryption_keys.filter((key) => {
      if (key.user_pub_key === this.pub_key) return true;
      else if (!key.user_pub_key) return true;
      else return false;
    })[0];

    let encryption_key = encryption_object.encryption_key;

    //decrypt if necessary
    if (
      encryption_object.user_pub_key &&
      encryption_object.user_pub_key === this.pub_key
    )
      encryption_key = QuickEncrypt.decrypt(encryption_key, this.private_key);

    return encryption_key;
  } catch (err) {
    console.log({ err });
    throw new Error(err);
  }
}
