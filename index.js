import {encryptText, encryptFile, decryptText, decryptFile, encryptWithKey} from './encryption.js';
import QuickEncrypt from 'quick-encrypt';
import ee from 'easy-encryption';
import { v4 as uuidv4 } from 'uuid';
import Fetch from './fetch.js';
import { ethers } from "ethers";

export default class SelfGuard {

  /**
   * It creates a new instance of the SelfGuard class
   * @param api_key - Your API key.
   * @param public_key - Optional public key for asymmetric encryption
   * @param private_key - Optional private key for asymmetric encryption
   */
  constructor(api_key, public_key, private_key, api_domain) {
    this.api_domain = api_domain || "https://api.selfguard.xyz";
    this.api_key = api_key;
    this.pub_key = public_key; //optional
    this.private_key = private_key; //optional
    this.fetch = new Fetch(this.api_domain, this.api_key);
  }


// Array Functions

 /**
  * It creates a new array, and then creates an underlying encryption key for the array.
  * @param name - the name of the array
  * @returns A boolean value of true if the array gets created
  */
  async createArray(name){
    try {
      // create array
      await this.fetch.initArray({name})

      //create underlying encryption key for array
      let encryption_key = uuidv4();
      
      //if public key is set, then asymmetrically encrypt the encryption key
      if(this.pub_key) encryption_key = QuickEncrypt.encrypt(encryption_key, this.pub_key);

      //save encryption key
      await this.fetch.saveArrayEncryptionKey({name,user_pub_key:this.pub_key,encryption_key});
      return true;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }


 /**
  * > This function adds a user to an array by encrypting the array's encryption key with the user's
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
      await this.fetch.saveArrayEncryptionKey({name,user_pub_key,encryption_key});
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
      let encrypted_data = ee.encrypt(encryption_key,JSON.stringify(value));

      //save the value
      await this.fetch.saveArrayValue({name,encrypted_data});
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
      let arr = data.map((a)=>{
        let data = ee.decrypt(encryption_key, a.encrypted_data);
        return JSON.parse(data);
      });

      return arr;
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

// Key-Value Functions

  /**
   * If the key exists, update it. If it doesn't exist, create it
   * @param key - the key to store the value under
   * @param value - The value to be stored in the database.
   * @param options - {
   * @returns A boolean value.
   */
  async put(key, value, options) {
    try {
      //if key exists, update it
      let value2 = await this.get(key);
      let {encryption_key_id, encrypted_text} = await this.encrypt(JSON.stringify(value),options);
      await this.fetch.updateKeyValueData({key, encrypted_text, encryption_key_id});
      return true;
    }
    catch(err){
      //else create the new key value
      try {
        let {encryption_key_id, encrypted_text} = await this.encrypt(JSON.stringify(value),options);
        await this.fetch.saveKeyValueData({key, encrypted_text, encryption_key_id});
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
   * It retrieves the encrypted value from the database and decrypts it.
   * @param key - The key you want to retrieve
   * @param options - {
   * @returns The value of the key
   */
  async get(key, options) {
    try {
      let {encryption_key_id, encrypted_text, id} = await this.fetch.retrieveKeyValueData({key});
      let value = await this.decrypt(encrypted_text,encryption_key_id,options);
      return JSON.parse(value);
    }
    catch(err){
      console.log({err})
      throw new Error(err);
    }
  }

  /**
   * It returns all the keys for this user in the database.
   * @param options - {
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

//Tokenization Functions

/**
 * It takes in some data, encrypts it, and saves it to the database.
 * @param data - The data you want to tokenize.
 * @returns A tokenized data object.
 */
  async tokenize(data) {
    try {
      let {encryption_key_id, encrypted_text} = await this.encrypt(JSON.stringify(data));
      let id = "tok_"+uuidv4();
      await this.fetch.saveTokenizedData({id, encrypted_text, encryption_key_id});
      return id;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  /**
   * It takes an id and returns the decrypted data.
   * @param id - The id of the tokenized data you want to retrieve.
   * @returns The decrypted data is being returned.
   */
  async detokenize(id) {
    try {
      let {encryption_key_id, encrypted_text} = await this.fetch.retrieveTokenizedData({id})
      let decrypted_data = await this.decrypt(encrypted_text,encryption_key_id);
      return JSON.parse(decrypted_data);
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  /**
   * It takes a string of text and an options object, encrypts the text, uploads the encryption key to
   * the server, and returns an object with the encryption key id and the encrypted text
   * @param text - The text you want to encrypt
   * @returns The encrypted text and the encryption key id
   */
  async encrypt(value){
    try {
      let {encryption_key, ciphertext} = await encryptText(value);
      let encryption_key_id = await this.uploadEncryptionKey(encryption_key);
      return {encryption_key_id, ciphertext};
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  /**
   * It takes a string of text and a password, and returns an encrypted string of text
   * @param text - The text to be encrypted
   * @param password - The password to use for encryption.
   * @returns The encrypted text.
   */
  encryptWithPassword(text, password){
    try {
      return ee.encrypt(password, text);
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  /**
   * It takes a file, encrypts it, uploads the encryption key to the server, and returns the encrypted
   * file and the encryption key id
   * @param file - The file you want to encrypt
   * @param options - {
   * @returns The encrypted file and the encryption key id
   */
  async encryptFile(file,options){
    try {
      let {blob,passphrase,encryptedName} = await encryptFile(file,options);
      let id = await this.uploadEncryptionKey(passphrase);
      let encryptedFile = new File([blob],encryptedName,{type:file.type});
      return {encrypted_file:encryptedFile, encryption_key_id:id};
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  /**
   * It decrypts the text using the encryption key.
   * @param text - The text to be decrypted
   * @param id - The id of the user you want to encrypt/decrypt the text for.
   * @param options - {
   * @returns The decrypted text.
   */
  async decrypt(text, id, options){
    try {
      let encryption_key = options && options.encryption_key ? options.encryption_key : await this.downloadEncryptionKey(id);
      let decryptedText = await decryptText(text,encryption_key);
      return decryptedText;
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
  decryptWithPassword(text, password){
    try {
      return ee.decrypt(password, text);
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
  async decryptFile(file, id, options){
    let encryption_key = options && options.encryption_key ? options.encryption_key : await this.downloadEncryptionKey(id);
    let decrypted = await decryptFile(file,encryption_key);
    let decryptedName = await decryptText(file.name,encryption_key);
    let decryptedFile = new File([decrypted],decryptedName,{type:file.type});
    return decryptedFile
  }

  /**
   * > This function downloads the encryption key from the server and decrypts it with the private key
   * @param id - the id of the encryption key you want to download
   * @returns The encryption key is being returned.
   */
  async downloadEncryptionKey(id){
    try {
      let encryption_key = await this.fetch.retrieveEncryptionKey({id});
      if(this.pub_key) encryption_key = QuickEncrypt.decrypt(encryption_key, this.private_key) // unwrap with private key
      return encryption_key;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  /**
   * It takes an encryption key, encrypts it with the user's public key, and then uploads it to the
   * server
   * @param encryption_key - The encryption key that you want to upload to the server.
   * @returns The encryption key is being returned.
   */
  async uploadEncryptionKey(encryption_key){
    try {
      if(this.pub_key) encryption_key = QuickEncrypt.encrypt(encryption_key, this.pub_key) // wrap with public key
      let data = await this.fetch.saveEncryptionKey({encryption_key});
      return data;
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
   * This function is an asynchronous function that returns a promise. The promise is resolved with the
   * data returned from the fetch.retrieveKeyPairs() function
   * @returns An array of objects.
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
   * It takes a public and private key, encrypts the private key with a password, and then sends the
   * public key and encrypted private key to the server
   * @param password - The password you want to use to encrypt your private key.
   * @returns The data is being returned.
   */
  async uploadKeyPair({public_key, private_key}, password){
    try {
      let encrypted_private_key = this.encryptWithPassword(private_key,password);
      let data = await this.fetch.saveKeyPair({public_key, encrypted_private_key});
      return data;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  //Notifications

  /**
   * It sends an email.
   * @returns A boolean value of true.
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
   * @returns A promise that resolves to true if the SMS was sent successfully.
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
   * This function is an asynchronous function that calls the retrieveEvents function in the fetch.js
   * file and returns the data
   * @returns An array of objects.
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