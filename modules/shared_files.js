import {retrieveIPFSFile} from '../helpers/ipfs.js';
import {retrieveR2File} from '../helpers/r2.js';
import {decryptBytes} from '../helpers/encryption.js';
import { v4 as uuidv4 } from 'uuid';

export async function shareFile(file_id, {email_address, wallet_address, type}){
  let id = uuidv4();

  //retrieve each encryption key for each file shard and decrypt it
  let {file_shards} = await this.fetch.retrieveFile(file_id);
  for(let i = 0; i < file_shards.length;i++){
    try {
      let {encryption_instance} = file_shards[i];
      let encryption_key = await this.decryptEncryptionKey(encryption_instance.encryption_keys[0]);
      
      let new_encryption_instance;
      //If the type is link, decrypt each encryption key for the file shard and re-encrypt and make a new file shard
      if(type === 'link'){
        new_encryption_instance = await this.encryptEncryptionKey(encryption_key,'file-link');
      }
      //if the type is a metamask address, save the encryption key for the wallet address
      else if(type === 'wallet'){
        new_encryption_instance = await this.encryptEncryptionKey(encryption_key,'file', wallet_address);
      }
      //if the type is a email, save the encryption key for the address associated to the email
      else if(type === 'email'){
        let email_wallet_address = await this.fetch.getAddressForEmail(email_address);
        new_encryption_instance = await this.encryptEncryptionKey(encryption_key,'file', email_wallet_address);
      }
      file_shards[i].encryption_instance = new_encryption_instance;
    }
    catch(err){
      console.log({err});
    }
  }
  await this.fetch.saveSharedFile({email_address, wallet_address, type, id, file_id, file_shards});
  return id;
}

// export function that takes in a shared_file_id that calls fetch.deleteSharedFile with the respective id
export async function deleteSharedFile(shared_file_id){
  let data = await this.fetch.deleteSharedFile(shared_file_id);
  return data;
}

export async function retrieveSharedFiles(){
  let data = await this.fetch.retrieveSharedFiles();
  return data;
}

export async function retrieveSharedFile(id){
  let data = await this.fetch.retrieveSharedFile(id);
  return data;
}

export async function retrieveFileByLink(id){
  let data = await this.fetch.retrieveFileByLink(id);
  return data;
}

export async function decryptSharedFile(file_id, callback){
  try {
    let {file_shards, file} = await this.fetch.retrieveSharedFile(file_id);
    let {name, type, size} = file;
    //decrypt each shard
    let decrypted_shards = [];
    let downloadedSoFar = 0;
    for(let i = 0; i < file_shards.length;i++){
        try {
          let {encryption_instance, cid, metadata} = file_shards[i];

          let so_far = downloadedSoFar;

          let callbackF = (downloaded)=>{
            callback(null, (100* ((so_far+downloaded)/size)).toFixed(2));
          }

          //retrieve the file
          let encrypted_file = metadata === 'raw_r2_upload' ? await retrieveR2File.call(this, cid, callbackF) : await retrieveIPFSFile.call(this, cid, callbackF);
          downloadedSoFar += encrypted_file.size;

          //decrypt the encryption key
          let encryption_key = await this.decryptEncryptionKey(encryption_instance.encryption_keys[0]);

          //decrypt the shard
          let encrypted_bytes = await encrypted_file.arrayBuffer();

          let decrypted_shard = await decryptBytes(encrypted_bytes, encryption_key);
          decrypted_shards.push(decrypted_shard);
        }
        catch(err){
          console.log({err});
          throw new Error(err);
        }
    }

    try {
      let file = new File(decrypted_shards, name,{name,type});
      return file;
    }
    catch(err){
      console.log({err});
      throw err;
    }
  } 
  catch(err){
    console.log({err});
    throw new Error(err);
  }
}