import { v4 as uuidv4 } from 'uuid';

export async function getNotificationGroupByName(collection_name){
  let data = await this.fetch.getNotificationGroupByName(collection_name);
  return data;
}

export async function shareFile(file_id, {email_address, wallet_address, type}){
  let id = uuidv4();
  let new_file_shards = [];

  //retrieve each encryption key for each file shard and decrypt it
  let {file_shards} = await this.fetch.retrieveFile(file_id);
  let encryption_keys = [];
  for(let i = 0; i < file_shards.length;i++){
    try {
      let {encryption_instance} = file_shards[i];
      let encryption_key = await this.decryptEncryptionKey(encryption_instance.encryption_keys[0]);
      encryption_keys.push(encryption_key);
    }
    catch(err){
      console.log({err});
    }
  }

  //If the type is link, decrypt each encryption key for the file shard and re-encrypt and make a new file shard


  //check if type is metmask, then re-encrypt for metamask

  //check if type is email 


  let data = await this.fetch.saveSharedFileAssociation({email_address, wallet_address, type, id, file_id, file_shards:new_file_shards});
  return data;
}

export async function retrieveSharedFiles(){
  let data =this.fetch.retrieveSharedFiles();
  return data;
}

export async function retrieveSharedFile(id){
  let data =this.fetch.retrieveSharedFile(id);
  return data;
}

export async function retrieveFileByLink(id){
  let data = await this.fetch.retrieveFileByLink(id);
  return data;
}