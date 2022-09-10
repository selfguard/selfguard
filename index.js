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
  async createArray(key){
    let data = await this.fetch.saveArrayKey({key})
    let encryption_key = uuidv4();
    if(this.pub_key) encryption_key = QuickEncrypt.encrypt(encryption_key, this.pub_key);
    await this.fetch.saveArrayEncryptionKey({key,user_pub_key:this.pub_key,encryption_key});
    return data;
  }

  //add encryption_key to array
  async addUserToArray(key, user_pub_key, options){
    let keys = await this.fetch.getArrayEncryptionKeys({key});
    let encryption_object = keys.filter((key)=>{
      if(key.user_pub_key === this.pub_key) return true;
      else return false;
    })[0];
    if(encryption_object){
      let encryption_key = encryption_object.encryption_key;
      if(encryption_object.user_pub_key && encryption_object.user_pub_key === this.pub_key) encryption_key = QuickEncrypt.decrypt(encryption_key, this.private_key);
      encryption_key = QuickEncrypt.encrypt(encryption_key, user_pub_key);
      await this.fetch.saveArrayEncryptionKey({key,user_pub_key,encryption_key});
    }
  }

  //Array Key-Value Functions
  async addToArray(key, value, options) {
    //get encryption key
    let keys = await this.fetch.getArrayEncryptionKeys({key});

    let encryption_object = keys.filter((key)=>{
      if(key.user_pub_key === this.pub_key) return true;
      else if(!key.user_pub_key) return true;
      else return false;
    })[0];

    let encryption_key = encryption_object.encryption_key;
    if(encryption_object.user_pub_key && encryption_object.user_pub_key === this.pub_key) encryption_key = QuickEncrypt.decrypt(encryption_key, this.private_key);

    //encrypt the data
    let encrypted_data = ee.encrypt(encryption_key,JSON.stringify(value));

    //save the value
    let data = await this.fetch.saveArrayValue({key,encrypted_data});
    return
  }

  async getArray(key, gte, limit){
    let data = await this.fetch.getArrayValues({key, limit, gte});
    let encryption_keys = await this.fetch.getArrayEncryptionKeys({key});
    //get encryption_key
    let encryption_object = encryption_keys.filter((key)=>{
      if(key.user_pub_key === this.pub_key) return true;
      else if(!key.user_pub_key) return true;
      else return false;
    })[0];

    let encryption_key = encryption_object.encryption_key;
    if(encryption_object.user_pub_key && encryption_object.user_pub_key === this.pub_key) encryption_key = QuickEncrypt.decrypt(encryption_key, this.private_key);

    if(encryption_object.user_pub_key && encryption_object.user_pub_key === this.pub_key) encryption_key = QuickEncrypt.decrypt(encryption_key, this.private_key);

    //decrypt each value in the array
    let arr = data[0].array_values.map((a)=>{
      let data = ee.decrypt(encryption_key, a.encrypted_data);
      return JSON.parse(data);
    });

    return arr;
  }

  async getArrayKeys() {
    let data = await this.fetch.getArrayKeys();
    return data;
  }

  //Key-Value Functions
  async put(key, value, options) {
    try {
      let value2 = await this.get(key);
      let {encryption_key_id, encrypted_text} = await this.encrypt(JSON.stringify(value),options);
      await this.fetch.updateKeyValueData({key, encrypted_text, encryption_key_id});
    }
    catch(err){
      let {encryption_key_id, encrypted_text} = await this.encrypt(JSON.stringify(value),options);
      await this.fetch.saveKeyValueData({key, encrypted_text, encryption_key_id});
    }
    return true;
  }

  async get(key, options) {
    let {encryption_key_id, encrypted_text, id} = await this.fetch.retrieveKeyValueData({key});
    let value = await this.decrypt(encrypted_text,encryption_key_id,options);
    return JSON.parse(value);
  }

  async getAllKeys(options) {
    let data = await this.fetch.retrieveAllKeys();
    return data;
  }

  //Tokenization Functions
  async tokenize(data) {
    let {encryption_key_id, encrypted_text} = await this.encrypt(JSON.stringify(data));
    let id = "tok_"+uuidv4();
    await this.fetch.saveTokenizedData({id, encrypted_text, encryption_key_id});
    return id;
  }

  async detokenize(id) {
    let {encryption_key_id, encrypted_text} = await this.fetch.retrieveTokenizedData({id})
    let decrypted_data = await this.decrypt(encrypted_text,encryption_key_id);
    return JSON.parse(decrypted_data);
  }

  //Encrypt Functions
  async encrypt(text,options){
    let {passphrase, encryptedText} = await encryptText(text,options);
    let id = await this.uploadEncryptionKey(passphrase);
    return {encryption_key_id:id,encrypted_text:encryptedText};
  }

  async encryptFile(file,options){
    let {blob,passphrase,encryptedName} = await encryptFile(file,options);
    let id = await this.uploadEncryptionKey(passphrase);
    let encryptedFile = new File([blob],encryptedName,{type:file.type});
    return {encrypted_file:encryptedFile, encryption_key_id:id};
  }

  //Decrypt Functions
  async decrypt(text, id, options){
    if(options && options.password){
      return ee.decrypt(options.password, text);
    }
    let encryption_key = options && options.encryption_key ? options.encryption_key : await this.downloadEncryptionKey(id);
    let decryptedText = await decryptText(text,encryption_key);
    return decryptedText;
  }

  async decryptFile(file, id, options){
    let encryption_key = options && options.encryption_key ? options.encryption_key : await this.downloadEncryptionKey(id);
    let decrypted = await decryptFile(file,encryption_key);
    let decryptedName = await decryptText(file.name,encryption_key);
    let decryptedFile = new File([decrypted],decryptedName,{type:file.type});
    return decryptedFile
  }

  //Public/Private Key Generation
  generatePublicPrivateKeyPair(type,password){
    if(type === 'rsa'){
      let keys = QuickEncrypt.generate(1024);
      let encrypted_private_key = ee.encrypt(password,keys.private);
      return {
        public_key:keys.public,
        encrypted_private_key,
        private_key:keys.private
      };
    }
    else if(type == 'ecdsa'){
      let wallet = ethers.Wallet.createRandom();
      let encrypted_private_key = ee.encrypt(password,wallet.privateKey);

      return {
        public_key: wallet.publicKey,
        encrypted_private_key,
        private_key: wallet.privateKey
      }
    }
  }

  //Download Data Keys & Key Pairs
  async downloadEncryptionKey(id){
    let encryption_key = await this.fetch.retrieveEncryptionKey({id});
    if(this.pub_key) encryption_key = QuickEncrypt.decrypt(encryption_key, this.private_key) // unwrap with private key
    return encryption_key;
  }

  async getKeyPairs(){
    let data = await this.fetch.retrieveKeyPairs();
    return data;
  }

  //Upload Encryption Data Key & Key Pair

  async uploadEncryptionKey(encryption_key){
    if(this.pub_key) encryption_key = QuickEncrypt.encrypt(encryption_key, this.pub_key) // wrap with public key
    let data = await this.fetch.saveEncryptionKey({encryption_key});
    return data;
  }

  async uploadKeyPair(public_key, encrypted_private_key){
    let data = await this.fetch.saveKeyPair({public_key, encrypted_private_key});
    return data;
  }

  // Send Email To Address
  async sendEmail({address, from, fromName, replyTo, replyToName, subject, html}){
    let data = await this.fetch.sendEmailCall({address, from, fromName, replyTo, replyToName, subject, html});
    return data;
  }

  // Send SMS to Phone Number
  async sendSMS({address, text}){
    let data = await this.fetch.sendSMSCall({address, text});
    return data;
  }

  async retrieveEvents(){
    let data = await this.fetch.retrieveEvents();
    return data;
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
