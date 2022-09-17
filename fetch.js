import axios from "axios";
import QuickEncrypt from 'quick-encrypt';

export default class Fetch {

  constructor(api_key, public_key, private_key, api_domain) {
    this.url = api_domain || "https://api.selfguard.xyz";
    this.api_key = api_key;
    this.pub_key = public_key; //optional
    this.private_key = private_key; //optional
  }

  // Encryption Keys
  async saveEncryptionKey(encryption_key){
    if(this.pub_key) encryption_key = QuickEncrypt.encrypt(encryption_key, this.pub_key) // wrap with public key
    let result = await axios.post(this.url + "/saveEncryptionKey",{data:{key:encryption_key, api_key:this.api_key}});
    return result.data;
  }

  async retrieveEncryptionKey(id){
    let result = await axios.post(this.url + "/retrieveEncryptionKey",{data:{id, api_key:this.api_key}});
    let encryption_key = result.data;
    if(this.pub_key) encryption_key = QuickEncrypt.decrypt(encryption_key, this.private_key) // unwrap with private key
    return encryption_key;
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





