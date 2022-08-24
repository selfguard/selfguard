import axios from "axios";

export async function createAPIKey(axios,apiDomain){
  try {
    let result = await axios.post(apiDomain + "/createAPIKey");
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

export async function retrieveAPIKey(axios,apiDomain){
  try {
    let result = await axios.post(apiDomain + "/retrieveAPIKey");
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

//Data Key Setters and Getters
export async function saveEncryptionKey(apiDomain,api_key,key) {
  try {
    let result = await axios.post(apiDomain + "/saveEncryptionKey",{data:{api_key,key}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

export async function retrieveEncryptionKey(apiDomain,api_key,id) {
  try {
    let result = await axios.post(apiDomain + "/retrieveEncryptionKey",{data:{api_key,id}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

//Public/Private Key Setters and Getters
export async function saveKeyPair(apiDomain,api_key, public_key, encrypted_private_key){
  try {
    let result = await axios.post(apiDomain + "/saveKeyPair",{data:{api_key,public_key, encrypted_private_key}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

export async function retrieveKeyPair(apiDomain,api_key){
  try {
    let result = await axios.post(apiDomain + "/retrieveKeyPair",{data:{api_key}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

export async function saveTokenizedData(apiDomain, api_key,id, encrypted_text, encryption_key_id){
  try {
    let result = await axios.post(apiDomain + "/saveTokenizedData",{data:{api_key,id,encrypted_text, encryption_key_id}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}

export async function updateTokenizedData(apiDomain, api_key, id, encrypted_text, encryption_key_id){
  try {
    let result = await axios.post(apiDomain + "/updateTokenizedData",{data:{api_key,id,encrypted_text, encryption_key_id}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}


export async function retrieveTokenizedData(apiDomain, api_key, id){
  try {
    let result = await axios.post(apiDomain + "/retrieveTokenizedData",{data:{api_key,id}});
    return result.data;
  }
  catch(err){
    console.log({err});
  }
}
