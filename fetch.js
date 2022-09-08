import axios from "axios";

export default class Fetch {

  constructor(api_domain, api_key) {
    this.url = api_domain || "https://api.selfguard.xyz";
    this.api_key = api_key;
  }

  // Encryption Keys
  async saveEncryptionKey({encryption_key}) {
    try {
      let result = await axios.post(this.url + "/saveEncryptionKey",{data:{key:encryption_key,api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }

  async retrieveEncryptionKey({id}) {
    try {
      let result = await axios.post(this.url + "/retrieveEncryptionKey",{data:{id,api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }

  //Public/Private Key Setters and Getters
  async saveKeyPair({public_key, encrypted_private_key}){
    try {
      let result = await axios.post(this.url + "/saveKeyPair",{data:{public_key, encrypted_private_key, api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }

  async retrieveKeyPair(){
    try {
      let result = await axios.post(this.url + "/retrieveKeyPair",{data:{api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }

  //Tokenization Setters and Getters
  async saveTokenizedData({id, encrypted_text, encryption_key_id}){
    try {
      let result = await axios.post(this.url + "/saveTokenizedData",{data:{id, encrypted_text, encryption_key_id, api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }

  async updateTokenizedData({id, encrypted_text, encryption_key_id}){
    try {
      let result = await axios.post(this.url + "/updateTokenizedData",{data:{id,encrypted_text, encryption_key_id, api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }

  async retrieveTokenizedData({id}){
    try {
      let result = await axios.post(this.url + "/retrieveTokenizedData",{data:{id,api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }

  //Key Value Setters and Getters
  async saveKeyValueData({key, encrypted_text, encryption_key_id}){
    try {
      let result = await axios.post(this.url + "/saveKeyValueData",{data:{ key, encrypted_text, encryption_key_id,api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }

  async updateKeyValueData({key, encrypted_text, encryption_key_id}){
    try {
      let result = await axios.post(this.url + "/updateKeyValueData",{data:{ key, encrypted_text, encryption_key_id, api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }

  async retrieveKeyValueData({key}){
    try {
      let result = await axios.post(this.url + "/retrieveKeyValueData",{data:{ key, api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }


  //Notifications API
  async sendSMSCall({address, text}) {
    try {
      let result = await axios.post(this.url + "/sendSMS",{data:{ address, text, api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }

  async sendEmailCall({address, from, fromName, replyTo, replyToName, subject, html}) {
    try {
      let result = await axios.post(this.url + "/sendEmail",{data:{ address, from, fromName, replyTo, replyToName, subject, html, api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }


  async saveArrayKey({key}) {
    try {
      let result = await axios.post(this.url + "/saveArrayKey",{data:{key, api_key:this.api_key }});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }


  async saveArrayEncryptionKey({key, encryption_key, user_pub_key}) {
    try {
      let result = await axios.post(this.url + "/saveArrayEncryptionKey",{data:{key, encryption_key, user_pub_key, api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }


  async saveArrayValue({encrypted_data, key}) {
    try {
      let result = await axios.post(this.url + "/saveArrayValue",{data:{encrypted_data, key, api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }


  async getArrayValues({gte, limit, key}) {
    try {
      let result = await axios.post(this.url + "/getArrayValues",{data:{gte, limit, key, api_key: this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }


  async getArrayKeys() {
    try {
      let result = await axios.post(this.url + "/getArrayKeys",{data:{api_key: this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }

  async getArrayEncryptionKeys({key}) {
    try {
      let result = await axios.post(this.url + "/getArrayEncryptionKeys",{data:{key, api_key:this.api_key}});
      return result.data;
    }
    catch(err){
      console.log({err});
    }
  }
}





