import axios from "axios";

export default class Fetch {

  constructor(api_domain, api_key) {
    this.url = api_domain || "https://api.selfguard.xyz";
    this.api_key = api_key;
  }

  // Encryption Keys
  async saveEncryptionKey({encryption_key}) {
    let result = await axios.post(this.url + "/saveEncryptionKey",{data:{key:encryption_key,api_key:this.api_key}});
    return result.data;
  }

  async retrieveEncryptionKey({id}) {
    let result = await axios.post(this.url + "/retrieveEncryptionKey",{data:{id,api_key:this.api_key}});
    return result.data;
  }

  //Public/Private Key Setters and Getters
  async saveKeyPair({public_key, encrypted_private_key}){
    let result = await axios.post(this.url + "/saveKeyPair",{data:{public_key, encrypted_private_key, api_key:this.api_key}});
    return result.data;
  }

  async retrieveKeyPairs(){
    let result = await axios.post(this.url + "/retrieveKeyPairs",{data:{api_key:this.api_key}});
    return result.data;
  }

  //Tokenization Setters and Getters
  async saveTokenizedData({id, encrypted_text, encryption_key_id}){
    let result = await axios.post(this.url + "/saveTokenizedData",{data:{id, encrypted_text, encryption_key_id, api_key:this.api_key}});
    return result.data;
  }

  async updateTokenizedData({id, encrypted_text, encryption_key_id}){
    let result = await axios.post(this.url + "/updateTokenizedData",{data:{id,encrypted_text, encryption_key_id, api_key:this.api_key}});
    return result.data;
  }

  async retrieveTokenizedData({id}){
    let result = await axios.post(this.url + "/retrieveTokenizedData",{data:{id,api_key:this.api_key}});
    return result.data;
  }

  //Key Value Setters and Getters
  async saveKeyValueData({key, encrypted_text, encryption_key_id}){
    let result = await axios.post(this.url + "/saveKeyValueData",{data:{ key, encrypted_text, encryption_key_id,api_key:this.api_key}});
    return result.data;
  }

  async updateKeyValueData({key, encrypted_text, encryption_key_id}){
    let result = await axios.post(this.url + "/updateKeyValueData",{data:{ key, encrypted_text, encryption_key_id, api_key:this.api_key}});
    return result.data;
  }

  async retrieveKeyValueData({key}){
    let result = await axios.post(this.url + "/retrieveKeyValueData",{data:{ key, api_key:this.api_key}});
    return result.data;
  }

  async retrieveAllKeys(){
    let result = await axios.post(this.url + "/retrieveAllKeys",{data:{ api_key:this.api_key}});
    return result.data;
  }

  //Notifications API
  async sendSMSCall({address, text}) {
    let result = await axios.post(this.url + "/sendSMS",{data:{ address, text, api_key:this.api_key}});
    return result.data;
  }

  async sendEmailCall({address, from, fromName, replyTo, replyToName, subject, html}) {
    let result = await axios.post(this.url + "/sendEmail",{data:{ address, from, fromName, replyTo, replyToName, subject, html, api_key:this.api_key}});
    return result.data;
  }

  //Array Values
  async saveArrayKey({key}) {
    let result = await axios.post(this.url + "/saveArrayKey",{data:{key, api_key:this.api_key }});
    return result.data;
  }


  async saveArrayEncryptionKey({key, encryption_key, user_pub_key}) {
    let result = await axios.post(this.url + "/saveArrayEncryptionKey",{data:{key, encryption_key, user_pub_key, api_key:this.api_key}});
    return result.data;
  }


  async saveArrayValue({encrypted_data, key}) {
    let result = await axios.post(this.url + "/saveArrayValue",{data:{encrypted_data, key, api_key:this.api_key}});
    return result.data;
  }


  async getArrayValues({gte, limit, key}) {
    let result = await axios.post(this.url + "/getArrayValues",{data:{gte, limit, key, api_key: this.api_key}});
    return result.data;
  }


  async getArrayKeys() {
    let result = await axios.post(this.url + "/getArrayKeys",{data:{api_key: this.api_key}});
    return result.data;
  }

  async getArrayEncryptionKeys({key}) {
    let result = await axios.post(this.url + "/getArrayEncryptionKeys",{data:{key, api_key:this.api_key}});
    return result.data;
  }

  async retrieveEvents(){
    let result = await axios.post(this.url + "/retrieveEvents",{data:{api_key:this.api_key}});
    return result.data;
  }
}





