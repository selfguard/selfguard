import {encryptText, encryptFile, decryptText, decryptFile, encryptWithKey} from './encryption.js';
import QuickEncrypt from 'quick-encrypt';
import ee from 'easy-encryption';
import { v4 as uuidv4 } from 'uuid';
import Fetch from './fetch.js';
import { ethers } from "ethers";

//sanitize all functions and do exception checking
export default class SelfGuard {

  constructor(api_key, public_key, private_key, api_domain) {
    this.api_domain = api_domain || "https://api.selfguard.xyz";
    this.api_key = api_key;
    this.pub_key = public_key; //optional
    this.private_key = private_key; //optional
    this.fetch = new Fetch(this.api_domain, this.api_key);
  }

  //Array Functions

  //Initialize array
  async createArray(key){
    try {
      // create array key
      await this.fetch.saveArrayKey({key})

      //create underlying encryption key for array
      let encryption_key = uuidv4();

      //if public key is set, then asymmetrically encrypt the encryption key
      if(this.pub_key) encryption_key = QuickEncrypt.encrypt(encryption_key, this.pub_key);
      await this.fetch.saveArrayEncryptionKey({key,user_pub_key:this.pub_key,encryption_key});
      return true;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  //Add a new encryption key to the array that is able to be decrypted with the
  //respective user's private key
  async addUserToArray(key, user_pub_key, options){
    try {
      //get encryption key
      let encryption_key = await this.getMyEncryptionKeyForArray(key);

      //asymmetrically encrypt the key for the user_pub_key
      encryption_key = QuickEncrypt.encrypt(encryption_key, user_pub_key);

      //save the encryption key
      await this.fetch.saveArrayEncryptionKey({key,user_pub_key,encryption_key});
      return true;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  //Add a new value to the array
  async addToArray(key, value, options) {
    try {
      //get encryption key
      let encryption_key = await this.getMyEncryptionKeyForArray(key);

      //encrypt the data
      let encrypted_data = ee.encrypt(encryption_key,JSON.stringify(value));

      //save the value
      await this.fetch.saveArrayValue({key,encrypted_data});
      return true;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  //Get the array and specify which values are requested through gte and limit
  async getArray(key, gte, limit){
    try {
      // get the encryption key
      let encryption_key = await this.getMyEncryptionKeyForArray(key);

      // fetch the values in the array
      let data = await this.fetch.getArrayValues({key, limit, gte});

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

  //Retrieve all the array names created with the respective API Key
  async getArrayKeys() {
    try {
      let data = await this.fetch.getArrayKeys();
      return data;
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  //get the encryption key for the array for this user
  async getMyEncryptionKeyForArray(key){
    try {
      // get the encryption key
      let encryption_keys = await this.fetch.getArrayEncryptionKeys({key});

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

  //Key-Value Functions

  //put value for key
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

  //retrieve value for key
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

  //get all the keys created by this API_Key
  //options can include limit and gte
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

  //tokenize data
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

  //retrieve tokenized data
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

  //Encryption Functions

  //encrypt data and return the encryption_key_id and the raw ciphertext
  async encrypt(text, options){
    try {
      let {passphrase, encryptedText} = await encryptText(text,options);
      let id = await this.uploadEncryptionKey(passphrase);
      return {encryption_key_id:id,encrypted_text:encryptedText};
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  // encrypt data with a password and return the ciphertext
  encryptWithPassword(text, password){
    try {
      return ee.encrypt(password, text);
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  //encrypt a file
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

  //decrypt data based on the encryption_key_id
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

  //decrypt data with a password
  decryptWithPassword(text, password){
    try {
      return ee.decrypt(password, text);
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  //decrypt file with encryption_key_id
  async decryptFile(file, id, options){
    let encryption_key = options && options.encryption_key ? options.encryption_key : await this.downloadEncryptionKey(id);
    let decrypted = await decryptFile(file,encryption_key);
    let decryptedName = await decryptText(file.name,encryption_key);
    let decryptedFile = new File([decrypted],decryptedName,{type:file.type});
    return decryptedFile
  }

  //Download Encryption Key
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

  //Upload Encryption Key
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

  //create key pair for rsa or ecsda
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

  //get all the key pairs associated with thsi api key
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

  //upload the key pair
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

  // Send Email
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

  // Send SMS
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

  //Events

  // Get Events generated by this api key (i.e -> retrieving encryption keys)
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

//rotate encryption key
// (async ()=>{
//   let encrypted = await this.encrypt(value);
//   let update = await updateKeyValueData(this.api_domain, this.api_key, id, encrypted.encrypted_text, encrypted.encryption_key_id);
// })()

//rotate encryption key
// (async ()=>{
//   let encrypted = await this.encrypt(decrypted_data);
//   let update = await updateTokenizedData(this.api_domain,this.api_key, id, encrypted.encrypted_text, encrypted.encryption_key_id);
// })()
