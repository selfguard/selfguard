import axios from "axios";

//API Key Creation
export async function createAPIKey(axios,api_domain){
  try {
    let result = await axios.post(api_domain + "/createAPIKey");
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

export async function retrieveAPIKey(axios,api_domain){
  try {
    let result = await axios.post(api_domain + "/retrieveAPIKey");
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

//Encryption Data Key Setters and Getters
export async function saveEncryptionKey(api_domain,api_key,key) {
  try {
    let result = await axios.post(api_domain + "/saveEncryptionKey",{data:{api_key,key}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

export async function retrieveEncryptionKey(api_domain,api_key,id) {
  try {
    let result = await axios.post(api_domain + "/retrieveEncryptionKey",{data:{api_key,id}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

//Public/Private Key Setters and Getters
export async function saveKeyPair(api_domain,api_key, public_key, encrypted_private_key){
  try {
    let result = await axios.post(api_domain + "/saveKeyPair",{data:{api_key,public_key, encrypted_private_key}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

export async function retrieveKeyPair(api_domain,api_key){
  try {
    let result = await axios.post(api_domain + "/retrieveKeyPair",{data:{api_key}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

//Tokenization Setters and Getters
export async function saveTokenizedData(api_domain, api_key,id, encrypted_text, encryption_key_id){
  try {
    let result = await axios.post(api_domain + "/saveTokenizedData",{data:{api_key,id,encrypted_text, encryption_key_id}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

export async function updateTokenizedData(api_domain, api_key, id, encrypted_text, encryption_key_id){
  try {
    let result = await axios.post(api_domain + "/updateTokenizedData",{data:{api_key,id,encrypted_text, encryption_key_id}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

export async function retrieveTokenizedData(api_domain, api_key, id){
  try {
    let result = await axios.post(api_domain + "/retrieveTokenizedData",{data:{api_key,id}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

//Tokenization Setters and Getters
export async function saveKeyValueData(api_domain, api_key, key, encrypted_text, encryption_key_id){
  try {
    let result = await axios.post(api_domain + "/saveKeyValueData",{data:{api_key, key, encrypted_text, encryption_key_id}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

export async function updateKeyValueData(api_domain, api_key, id, encrypted_text, encryption_key_id){
  try {
    let result = await axios.post(api_domain + "/updateKeyValueData",{data:{api_key, id, encrypted_text, encryption_key_id}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

export async function retrieveKeyValueData(api_domain, api_key, key){
  try {
    let result = await axios.post(api_domain + "/retrieveKeyValueData",{data:{api_key, key}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

export async function sendSMSCall({api_domain, api_key,address, text}) {
  try {
    let result = await axios.post(api_domain + "/sendSMS",{data:{api_key, address, text}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

export async function sendEmailCall({api_domain, api_key,address, from, fromName, replyTo, replyToName, subject, html}) {
  try {
    let result = await axios.post(api_domain + "/sendEmail",{data:{api_key, address, from, fromName, replyTo, replyToName, subject, html}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

