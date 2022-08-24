import {encryptText, encryptFile, decryptText, decryptFile} from './encryption.js';
import {saveEncryptionKey, retrieveEncryptionKey, saveKeyPair, retrieveKeyPair, saveTokenizedData, retrieveTokenizedData, updateTokenizedData} from './fetch.js';
import QuickEncrypt from 'quick-encrypt';
import ee from 'easy-encryption';
import { v4 as uuidv4 } from 'uuid';

//sanitize all functions and do exception checking
export default class SelfGuard {

  constructor(api_key, public_key, private_key, api_domain) {
    this.api_domain = api_domain || "https://api.selfguard.xyz";
    this.api_key = api_key;

    this.public_key = public_key; //optional
    this.private_key = private_key; //optional
  }

  //Tokenization Functions
  async tokenize(data) {
    let {encryption_key_id, encrypted_text} = await this.encrypt(JSON.stringify(data));
    let id = "tok_"+uuidv4();
    await this.uploadTokenizedData(id,encryption_key_id, encrypted_text);
    return id;
  }

  async detokenize(id) {
    let {encryption_key_id, encrypted_text} = await this.downloadTokenizedData(id);
    let decrypted_data = await this.decrypt(encrypted_text,encryption_key_id);

    //rotate encryption key
    (async ()=>{
      let encrypted = await this.encrypt(decrypted_data);
      let update = await this.rotateTokenizedData(id,encrypted.encryption_key_id, encrypted.encrypted_text);
    })()

    return JSON.parse(decrypted_data);
  }

  //Encrypt Functions
  async encrypt(text){
    let {passphrase, encryptedText} = await encryptText(text);
    let id = await this.uploadEncryptionKey(passphrase);
    return {encryption_key_id:id,encrypted_text:encryptedText};
  }

  async encryptFile(file){
    let {blob,passphrase,encryptedName} = await encryptFile(file);
    let id = await this.uploadEncryptionKey(passphrase);
    let encryptedFile = new File([blob],encryptedName,{type:file.type});
    return {encrypted_file:encryptedFile, encryption_key_id:id};
  }

  //Decrypt Functions
  async decrypt(text,id){
    let encryption_key = await this.downloadEncryptionKey(id);
    let decryptedText = await decryptText(text,encryption_key);
    return decryptedText;
  }

  async decryptFile(file,id){
    let encryption_key = await this.downloadEncryptionKey(id);
    let decrypted = await decryptFile(file,encryption_key);
    let decryptedName = await decryptText(file.name,encryption_key);
    let decryptedFile = new File([decrypted],decryptedName,{type:file.type});
    return decryptedFile
  }

  //Public/Private Key Generation
  generatePublicPrivateKeyPair(password){

    let keys = QuickEncrypt.generate(1024);
    let encrypted_private_key = ee.encrypt(password,keys.private);

    return {
      public_key:keys.public,
      encrypted_private_key,
      private_key:keys.private
    };
  }

  //Wrapper Functions for Data Keys
  wrapWithPublicKey(encryption_key){
    let encrypted_encryption_key = QuickEncrypt.encrypt(encryption_key, this.public_key)
    return encrypted_encryption_key;
  }

  unwrapWithPrivateKey(encrypted_encryption_key){
    let encryption_key = QuickEncrypt.decrypt(encrypted_encryption_key, this.private_key)
    return encryption_key;
  }

  //Download Tokenized Data, Data Keys & Key Pairs
  async downloadTokenizedData(id){
    let {encrypted_text,encryption_key_id} = await retrieveTokenizedData(this.api_domain,this.api_key,id);
    return {encrypted_text,encryption_key_id} ;
  }

  async rotateTokenizedData(id,encryption_key_id, encrypted_text){
    let data = await updateTokenizedData(this.api_domain,this.api_key, id, encrypted_text, encryption_key_id);
    return data;
  }

  async downloadEncryptionKey(id){
    let encryption_key = await retrieveEncryptionKey(this.api_domain,this.api_key,id);
    if(this.public_key){
      encryption_key = this.unwrapWithPrivateKey(encryption_key, this.private_key);
    }
    return encryption_key;
  }

  async downloadKeyPair(password){
    let data = await retrieveKeyPair(this.api_domain,this.api_key);
    let private_key = ee.decrypt(password, data.encrypted_private_key);
    return {public_key: data.public_key, private_key};
  }

  //Upload Tokenization Data, Encryption Data Key & Key Pair

  async uploadTokenizedData(id,encryption_key_id, encrypted_text){
    let data = await saveTokenizedData(this.api_domain,this.api_key,id, encrypted_text, encryption_key_id);
    return data;
  }

  async uploadEncryptionKey(encryption_key){
    if(this.public_key) {
      encryption_key = this.wrapWithPublicKey(encryption_key, this.public_key);
    }
    let data = await saveEncryptionKey(this.api_domain,this.api_key, encryption_key);
    return data;
  }

  async uploadKeyPair(public_key, encrypted_private_key){
    let data = await saveKeyPair(this.api_domain,this.api_key, public_key, encrypted_private_key);
    return data;
  }

}