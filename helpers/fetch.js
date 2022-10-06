import axios from "axios";
import QuickEncrypt from 'quick-encrypt';
import {encryptData, decryptData, getPublicKey} from "./metamask";

export default class Fetch {

  constructor(api_key, public_key, private_key, api_domain) {
    this.url = api_domain || "https://api.selfguard.xyz";
    this.api_key = api_key;
    this.pub_key = public_key; //optional
    this.private_key = private_key; //optional
  }

  //Asymmetric Encryption Functions
  async asymmetricEncryption(data, metamaskKey){
    if(this.pub_key && this.pub_key != 'metamask') {
      data = QuickEncrypt.encrypt(encryption_key, this.pub_key) // wrap with public key
    }
    else if(this.pub_key === 'metamask') {
      if(!metamaskKey) metamaskKey = await getPublicKey();
      return await encryptData(data, metamaskKey);
    }
    return {ciphertext:data, metamask_address:null};
  }
  
  async asymmetricDecryption(public_key, metamask_address, data){
    if(public_key === this.pub_key && public_key != null && this.pub_key != 'metamask') {
      data = QuickEncrypt.decrypt(key, this.private_key) // unwrap with private key
    }
    else if(public_key === this.pub_key && this.pub_key === 'metamask') {
      data = await decryptData(metamask_address, data);
    }
    if(public_key && this.pub_key !== public_key){
      throw new Error("Public key mismatch for decryption")
    }
    return data;
  }

  // Encryption Keys
  async saveEncryptionKey(encryption_key){

    let {ciphertext, metamask_address} = await this.asymmetricEncryption(encryption_key);
    
    let result = await axios.post(this.url + "/saveEncryptionKey",{data:{public_key:this.pub_key, metamask_address, key:ciphertext, api_key:this.api_key}});
    return result.data;
  }

  async retrieveEncryptionKey(id){

    let result = await axios.post(this.url + "/retrieveEncryptionKey",{data:{id, api_key:this.api_key}});
    let {key, public_key, metamask_address} = result.data.encryption_keys[0];

    key = await this.asymmetricDecryption(public_key, metamask_address, key);

    return key;
  }

  //File Storage
  async saveFileAssociation({id, name, type, document_hash, file_shards})  {
    let metamaskKey = await getPublicKey();
    file_shards = await Promise.all(file_shards.map(async (f)=>{
      let {ciphertext, metamask_address} = await this.asymmetricEncryption(f.encryption_key.key,metamaskKey);
      f.encryption_key.key = ciphertext;
      f.encryption_key.metamask_address = metamask_address;
      return f;
    }));

    let result = await axios.post(this.url + "/saveFileAssociation",{data:{public_key:this.pub_key, api_key:this.api_key,id, name, type, document_hash, file_shards}});
    return result.data
  }

  async retrieveFile(id){
    let result = await axios.post(this.url + "/retrieveFile",{data:{api_key:this.api_key, id}});
    result.data.file_shards = await Promise.all(result.data.file_shards.map(async (shard)=>{
      shard.encryption_key = await this.asymmetricDecryption(shard.public_key, shard.metamask_address, shard.encryption_key);
      return shard;
    }));
    return result.data
  }

  async retrieveFiles(){
    let result = await axios.post(this.url + "/retrieveFiles",{data:{api_key:this.api_key}});
    return result.data
  }
  
   // Tokenization 
   async saveTokenizedData({id, ciphertext, encryption_key_id}){
    let result = await axios.post(this.url + "/saveTokenizedData",{data:{id, ciphertext, encryption_key_id, api_key:this.api_key}});
    return result.data;
  }

  async updateTokenizedData({id, ciphertext, encryption_key_id}){
    let result = await axios.post(this.url + "/updateTokenizedData",{data:{id,ciphertext, encryption_key_id, api_key:this.api_key}});
    return result.data;
  }

  async retrieveTokenizedData({id}){
    let result = await axios.post(this.url + "/retrieveTokenizedData",{data:{id,api_key:this.api_key}});
    return result.data;
  }

  // Key Pair
  async saveKeyPair({public_key, encrypted_private_key}){
    let result = await axios.post(this.url + "/saveKeyPair",{data:{public_key, encrypted_private_key, api_key:this.api_key}});
    return result.data;
  }

  async retrieveKeyPairs(){
    let result = await axios.post(this.url + "/retrieveKeyPairs",{data:{api_key:this.api_key}});
    return result.data;
  }
 

  // Key Value 
  async saveKeyValueData({key, ciphertext, encryption_key_id}){
    let result = await axios.post(this.url + "/saveKeyValueData",{data:{ key, ciphertext, encryption_key_id,api_key:this.api_key}});
    return result.data;
  }

  async updateKeyValueData({key, ciphertext, encryption_key_id}){
    let result = await axios.post(this.url + "/updateKeyValueData",{data:{ key, ciphertext, encryption_key_id, api_key:this.api_key}});
    return result.data;
  }

  async retrieveKeyValueData({key}){
    let result = await axios.post(this.url + "/retrieveKeyValueData",{data:{ key, api_key:this.api_key}});
    return result.data;
  }

  async retrieveAllKeys({gte, limit}){
    let result = await axios.post(this.url + "/retrieveAllKeys",{data:{ api_key:this.api_key, gte, limit}});
    return result.data;
  }

   // Array 
   async initArray({name}) {
    let result = await axios.post(this.url + "/initArray",{data:{name, api_key:this.api_key }});
    return result.data;
  }

  async saveArrayEncryptionKey({name, encryption_key, user_pub_key}) {
    let result = await axios.post(this.url + "/saveArrayEncryptionKey",{data:{name, encryption_key, user_pub_key, api_key:this.api_key}});
    return result.data;
  }

  async saveArrayValue({ciphertext, name}) {
    let result = await axios.post(this.url + "/saveArrayValue",{data:{ciphertext, name, api_key:this.api_key}});
    return result.data;
  }

  async getArrayValues({gte, limit, name}) {
    let result = await axios.post(this.url + "/getArrayValues",{data:{gte, limit, name, api_key: this.api_key}});
    return result.data;
  }

  async getArrayNames() {
    let result = await axios.post(this.url + "/getArrayNames",{data:{api_key: this.api_key}});
    return result.data;
  }

  async getArrayEncryptionKeys({name}) {
    let result = await axios.post(this.url + "/getArrayEncryptionKeys",{data:{name, api_key:this.api_key}});
    return result.data;
  }

  // Notifications
  async sendSMSCall({address, text}) {
    let result = await axios.post(this.url + "/sendSMS",{data:{ address, text, api_key:this.api_key}});
    return result.data;
  }

  async sendEmailCall({address, from, fromName, replyTo, replyToName, subject, html}) {
    let result = await axios.post(this.url + "/sendEmail",{data:{ address, from, fromName, replyTo, replyToName, subject, html, api_key:this.api_key}});
    return result.data;
  }

  // Events
  async retrieveEvents(){
    let result = await axios.post(this.url + "/retrieveEvents",{data:{api_key:this.api_key}});
    return result.data;
  }
}





