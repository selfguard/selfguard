import axios from "axios";

export default class Fetch {

  constructor(api_key,key_pair_type, public_key, private_key, api_domain) {
    this.url = api_domain || "https://api.selfguard.xyz";
    this.api_key = api_key;
    this.key_pair_type = key_pair_type; //optional
    this.public_key = public_key; //optional
    this.private_key = private_key; //optional
  }

  async send(link,data){
    axios.defaults.headers.common = {
      "X-API-Key": this.api_key
    };
    let result = await axios.post(this.url + link,{data:data});
    return result;
  }

  // Encryption Keys
  async saveEncryptionKey({id, public_key, key, wallet_type, type, wallet_address, asymmetrically_encrypted,lit_chain, lit_enabled, no_encryption, asymmetric_encryption_type}){
    let result = await this.send("/saveEncryptionKey",{id, public_key, type, key, wallet_type, wallet_address,lit_chain, asymmetrically_encrypted, lit_enabled, no_encryption, asymmetric_encryption_type});
    return result.data;
  }

  async retrieveEncryptionKey(id){
    let result = await this.send("/retrieveEncryptionKey",{id});
    return result.data;
  }

  //File Storage
  async saveFile({id, size, name, type, document_hash, file_shards})  {
    let result = await this.send("/saveFile",{id, size, name, type, document_hash, file_shards});
    return result.data
  }

  async retrieveFile(id){
    let result = await this.send("/retrieveFile",{id});
    return result.data
  }

  async retrieveFiles(){
    let result = await this.send("/retrieveFiles",{});
    return result.data
  }

  async getSignedR2PutURL({file_name, file_size}){
    let result = await this.send('/getSignedR2PutURL',{file_name, file_size});
    return result.data
  }
  
  async getSignedR2GetURL({cid}){
    let result = await this.send('/getSignedR2GetURL',{cid});
    return result.data
  }

  async getIPFSAPIKey({file_size}){
    let result = await this.send("/getIPFSAPIKey",{file_size});
    return result.data;
  }

  async getTotalFileSizeUploaded(){
    let result = await this.send("/getTotalFileSizeUploaded",{});
    return result.data;
  }

  async retrieveFileShareData(id){
    let result = await this.send("/retrieveFileShareData",{id});
    return result.data;
  }

  async getAddressForEmail(email_address){
    let result = await this.send("/getAddressForEmail",{email_address});
    return result.data;
  }

  //Shared File Storage
  async saveSharedFile({email_address, wallet_address, type, id, file_id, file_shards})  {
    let result = await this.send("/saveSharedFile",{email_address, wallet_address, type, id, file_id, file_shards});
    return result.data
  }

  async deleteSharedFile(id) {
    let result = await this.send("/deleteSharedFile",{id});
    return result.data;
  }

  async retrieveSharedFiles(){
    let result = await this.send("/retrieveSharedFiles",{});
    return result.data
  }

  async retrieveSharedFile(id){
    let result = await this.send("/retrieveSharedFile",{id});
    return result.data
  }

  async retrieveFileByLink(id){
    let result = await this.send("/retrieveFileByLink",{id});
    return result.data
  }
  
   // Tokenization 
   async saveTokenizedData({id, ciphertext, encryption_instance}){
    let result = await this.send("/saveTokenizedData",{id, ciphertext, encryption_instance});
    return result.data;
  }

  async updateTokenizedData({id, ciphertext, encryption_instance}){
    let result = await this.send("/updateTokenizedData",{id, ciphertext, encryption_instance});
    return result.data;
  }

  async retrieveTokenizedData(id){
    let result = await this.send("/retrieveTokenizedData",{id});
    return result.data;
  }

  // Key Pair
  async saveKeyPair({public_key, encrypted_private_key,type}){
    let result = await this.send("/saveKeyPair",{public_key, encrypted_private_key, type});
    return result.data;
  }

  async retrieveKeyPairs(){
    let result = await this.send("/retrieveKeyPairs",{});
    return result.data;
  }
 

  // Key Value 
  async saveKeyValueData({key, ciphertext, encryption_instance}){
    let result = await this.send("/saveKeyValueData",{ key, ciphertext, encryption_instance});
    return result.data;
  }

  async updateKeyValueData({key, ciphertext, encryption_instance}){
    let result = await this.send("/updateKeyValueData",{ key, ciphertext, encryption_instance});
    return result.data;
  }

  async retrieveKeyValueData(key){
    let result = await this.send("/retrieveKeyValueData",{ key});
    return result.data;
  }

  async retrieveAllKeys({gte, limit}){
    let result = await this.send("/retrieveAllKeys",{gte, limit});
    return result.data;
  }

   // Array 
   async initArray(name) {
    let result = await this.send("/initArray",{name });
    return result.data;
  }

  async saveArrayEncryptionKey({name, encryption_key, user_pub_key}) {
    let result = await this.send("/saveArrayEncryptionKey",{name, encryption_key, user_pub_key});
    return result.data;
  }

  async saveArrayValue({ciphertext, name}) {
    let result = await this.send("/saveArrayValue",{ciphertext, name});
    return result.data;
  }

  async getArrayValues({gte, limit, name}) {
    let result = await this.send("/getArrayValues",{gte, limit, name});
    return result.data;
  }

  async getArrayNames() {
    let result = await this.send("/getArrayNames",{});
    return result.data;
  }

  async getArrayEncryptionKeys(name) {
    let result = await this.send("/getArrayEncryptionKeys",{name});
    return result.data;
  }

  // Notifications
  async getNotificationGroupByName(collection_name){
    let result = await this.send("/getNotificationGroupByName",{collection_name});
    return result.data;
  }

  async getNotificationGroups(){
    let result = await this.send("/getNotificationGroups",{});
    return result.data;
  }

  async createNotificationGroup({contract_address, collection_name}){
    let result = await this.send("/createNotificationGroup",{contract_address, collection_name});
    return result.data;
  }

  async deleteNotificationGroup({collection_name}){
    let result = await this.send("/deleteNotificationGroup",{collection_name});
    return result.data;
  }

  async updateNotificationGroup({old_collection_name, contract_address, collection_name}){
    let result = await this.send("/updateNotificationGroup",{old_collection_name, contract_address, collection_name});
    return result.data;
  }

  async activateIntroductionMessage({collection_name,activate}){
    let result = await this.send("/activateIntroductionMessage",{collection_name,activate});
    return result.data;
  }

  async updateIntroductionMessage({notification_group_id, email_subject, email_body, sms_text}){
    let result = await this.send("/updateIntroductionMessage",{notification_group_id, email_subject, email_body, sms_text});
    return result.data;
  }

  async updateProfile({collection_name, user_address, ciphertext, encryption_instance, email_activated, phone_activated}){
    let result = await this.send("/updateProfile",{collection_name, user_address, ciphertext, encryption_instance, email_activated, phone_activated});
    return result.data;
  }

  async getProfiles({limit, offset, collection_name}){
    let result = await this.send("/getProfiles",{limit, offset, collection_name});
    return result.data;
  }

  async getProfile({user_address, collection_name}){
    let result = await this.send("/getProfile",{user_address, collection_name});
    return result.data;
  }

  async sendSMSCall({user_address, collection_name, text}) {
    let result = await this.send("/sendSMS",{ user_address, collection_name, text});
    return result.data;
  }

  async sendEmailCall({user_address, collection_name, subject, body}) {
    let result = await this.send("/sendEmail",{ user_address, collection_name, subject, body});
    return result.data;
  }

  async sendBulkSMSCall({collection_name, text}) {
    let result = await this.send("/sendBulkSMS",{collection_name, text});
    return result.data;
  }

  async sendBulkEmailCall({collection_name, subject, body}) {
    let result = await this.send("/sendBulkEmail",{collection_name, subject, body});
    return result.data;
  }

  async getNotificationCount(){
    let result = await this.send("/getNotificationCount",{});
    return result.data;
  }

  // Events
  async retrieveEvents(){
    let result = await this.send("/retrieveEvents",{});
    return result.data;
  }
}





