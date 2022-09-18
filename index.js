import {encryptValue, encryptFile, decryptValue, decryptFile} from './encryption.js';
import QuickEncrypt from 'quick-encrypt';
import ee from 'easy-encryption';
import { v4 as uuidv4 } from 'uuid';
import Fetch from './fetch.js';
import { ethers } from "ethers";

export default class SelfGuard {

  constructor(api_key, public_key, private_key, api_domain) {
    this.api_domain = api_domain || "https://api.selfguard.xyz";
    this.api_key = api_key;
    this.pub_key = public_key; //optional
    this.private_key = private_key; //optional
    this.fetch = new Fetch(this.api_key, this.pub_key, this.private_key, this.api_domain);
  }

  // Encryption SDK Methods

  /**
   * It encrypts a value and returns the encryption key id and the ciphertext.
   * @param value - The value you want to encrypt.
   * @returns The encryption key and the ciphertext
   */
   async encrypt(value){
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
  encryptWithPassword(value, password){
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
   * It takes a file, encrypts it, uploads the encryption key to the server, and returns the encrypted
   * file and the encryption key id
   * @param file - The file you want to encrypt.
   * @returns The encrypted file and the encryption key id.
   */
  async encryptFile(file){
    try {
      let {encrypted_blob, encryption_key, encrypted_name} = await encryptFile(file);
      let encryption_key_id = await this.fetch.saveEncryptionKey(encryption_key);
      let encrypted_file = new File([encrypted_blob], encrypted_name, {type:file.type});
      return {encrypted_file, encryption_key_id};
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
  async decrypt(value, encryption_key_id){
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
  decryptWithPassword(value, password){
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

  /**
   * It decrypts a file.
   * @param file - The file to be decrypted
   * @param id - The id of the file you want to download
   * @param options - an object with the following properties:
   * @returns A decrypted file
   */
  async decryptFile(file, encryption_key_id){
    try {
      let encryption_key = await this.fetch.retrieveEncryptionKey(encryption_key_id);
      let decrypted_blob = await decryptFile(file, encryption_key);
      let decrypted_name = await decryptValue(file.name, encryption_key);
      let decrypted_file = new File([decrypted_blob],decrypted_name,{type:file.type});
      return decrypted_file
    } 
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

//Tokenization Functions


 /**
  * It takes a value, encrypts it, saves it to the database, and returns the id of the saved data
  * @param value - The value to be tokenized.
  * @returns The id of the tokenized value
  */
 async tokenize(value) {
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
async detokenize(id) {
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

// Key Pair Functions

  /**
   * It creates a random key pair of the type specified
   * @param type - The type of keypair to generate. Currently only supports 'ecdsa' and 'rsa'.
   * @returns An object with a public key and a private key.
   */
  createKeyPair(type){
    try {
      if(type === 'ecdsa'){
        let wallet = ethers.Wallet.createRandom();
        return {
          public_key: wallet.publicKey,
          private_key: wallet.privateKey
        }
      }
      else {
        let keys = QuickEncrypt.generate(1024);
        return {
          public_key:keys.public,
          private_key:keys.private
        };
      }
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }


/**
 * It retrieves the key pairs from the database.
 * @returns An array of key pairs.
 */
  async getKeyPairs(){
    try {
      let data = await this.fetch.retrieveKeyPairs();
      return data;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }


 /**
  * It takes a public key and a private key, encrypts the private key with a password, and then saves
  * the public key and encrypted private key to the database
  * @param password - The password you want to use to encrypt your private key.
  * @returns A boolean value of true if the keypair was successfully saved
  */
  async uploadKeyPair({public_key, private_key}, password){
    try {
      let encrypted_private_key = this.encryptWithPassword(private_key,password);
      await this.fetch.saveKeyPair({public_key, encrypted_private_key});
      return true;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

// Key Value Functions


   /**
    * If the key exists, update it. If it doesn't exist, create it
    * @param key - the key to store the value under
    * @param value - the value you want to store
    * @returns A boolean value of true if the key/value was successfully updated
    */
   async put(key, value) {
    try {
      //if key exists, update it
      let value2 = await this.get(key);
      let {encryption_key_id, ciphertext} = await this.encrypt(value);
      await this.fetch.updateKeyValueData({key, ciphertext, encryption_key_id});
      return true;
    }
    catch(err){
      //else create the new key value
      try {
        let {encryption_key_id, ciphertext} = await this.encrypt(value);
        await this.fetch.saveKeyValueData({key, ciphertext, encryption_key_id});
        return true;
      }
      catch(err){
        console.log({err})
        throw new Error(err);
      }
    }
    return true;
  }


  /**
   * It fetches the encrypted data from the database, decrypts it, and returns the decrypted data
   * @param key - The key you want to retrieve the value for
   * @returns The value of the key
   */
  async get(key) {
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
  async getKeys(options) {
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


// Array Functions

 /**
  * It creates a new array, and then creates an underlying encryption key for the array.
  * @param name - the name of the array
  * @returns A boolean value of true if the array gets created
  */
  async initArray(name){
    try {
      // create array
      await this.fetch.initArray({name})

      //create underlying encryption key for array
      let encryption_key = uuidv4();
      
      //if public key is set, then asymmetrically encrypt the encryption key
      if(this.pub_key) encryption_key = QuickEncrypt.encrypt(encryption_key, this.pub_key);

      //save encryption key
      await this.fetch.saveArrayEncryptionKey({name, user_pub_key:this.pub_key, encryption_key});
      return true;
    }
    catch(err){
      console.log({err});
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
  async addUserToArray(name, user_pub_key){
    try {
      //get encryption key
      let encryption_key = await this.getMyEncryptionKeyForArray(name);

      //asymmetrically encrypt the key for the user_pub_key
      encryption_key = QuickEncrypt.encrypt(encryption_key, user_pub_key);

      //save the encryption key
      await this.fetch.saveArrayEncryptionKey({name, user_pub_key, encryption_key});
      return true;
    }
    catch(err){
      console.log({err});
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
  async addToArray(name, value) {
    try {
      //get encryption key
      let encryption_key = await this.getMyEncryptionKeyForArray(name);

      //encrypt the data
      let ciphertext = this.encryptWithPassword(value, encryption_key);

      //save the value
      await this.fetch.saveArrayValue({name ,ciphertext});
      return true;
    }
    catch(err){
      console.log({err});
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
  async getArray(name, gte, limit){
    try {
      // get the encryption key
      let encryption_key = await this.getMyEncryptionKeyForArray(name);

      // fetch the values in the array
      let data = await this.fetch.getArrayValues({name, limit, gte});

      //decrypt each value in the array
      return data.map((a)=>{
        return this.decryptWithPassword(a.ciphertext, encryption_key);
      });
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

 /**
  * It returns all the names of the arrays saved with the respective API Key
  * @returns An array of objects.
  */
  async getArrayNames() {
    try {
      let data = await this.fetch.getArrayNames();
      return data;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  /**
   * It gets the encryption key for an array, and if it's asymmetrically encrypted, it decrypts it
   * @param name - the name of the array you want to get the encryption key for
   * @returns The encryption key for the array.
   */
  async getMyEncryptionKeyForArray(name){
    try {
      // get the encryption key
      let encryption_keys = await this.fetch.getArrayEncryptionKeys({name});

      //filter it for the encryption key respective to my public key or an
      //encryption key that is not asymmetrically encrypted
      let encryption_object = encryption_keys.filter((key)=>{
        if(key.user_pub_key === this.pub_key) return true;
        else if(!key.user_pub_key) return true;
        else return false;
      })[0];

      let encryption_key = encryption_object.encryption_key;

      //decrypt if necessary
      if(encryption_object.user_pub_key && encryption_object.user_pub_key === this.pub_key) encryption_key = QuickEncrypt.decrypt(encryption_key, this.private_key);

      return encryption_key;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }


  //Notifications

  /**
   * It sends an email to the address provided.
   * @returns A boolean value of true if the email was sent.
   */
  async sendEmail({address, from, fromName, replyTo, replyToName, subject, html}){
    try {
      await this.fetch.sendEmailCall({address, from, fromName, replyTo, replyToName, subject, html});
      return true;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  /**
   * It sends an SMS to the address provided.
   * @returns A boolean value of true if the SMS was sent.
   */
  async sendSMS({address, text}){
    try {
      await this.fetch.sendSMSCall({address, text});
      return true;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  // Events


 /**
  * This function retrieves all events from the database and returns them as an array of events
  * @returns An array of events.
  */
  async retrieveEvents(){
    try {
      let data = await this.fetch.retrieveEvents();
      return data;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }
}