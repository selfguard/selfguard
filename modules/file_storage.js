import {storeWithProgress, calculateFileHash, retrieveFiles} from '../helpers/ipfs.js';
import {shardEncryptFile, decryptShard, combineUint8Arrays} from '../helpers/encryption.js';
import { File } from "web-file-polyfill"

let WEB3_STORAGE_URL = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDQxRjQ1QTY3NDQzRGJDNmQ3N0NEOThFYjJDZDVFZThERjRDMTlCYjciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTg5NTI4NTYxOTksIm5hbWUiOiJ0ZXN0In0.I-fSz9b0Thg3nC5bnHHURoYiaXKHC9E3dcvJM7IdV4A';

 /**
  * It takes a file, splits it into shards, encrypts each shard, and uploads them to IPFS
  * @param file - the file to be encrypted
  * @param numShards - The number of shards you want to split the file into.
  * @returns The file id associating all the shards is being returned.
  */
 export async function encryptFile(file, numShards){
    try {
      // shard the file and encryp them
      let shards = await shardEncryptFile(file,numShards);

      //save file assocation for each shard
      let document_hash = await calculateFileHash(file);
      let file_id = await this.fetch.saveFileAssociation({name:file.name, type:file.type, document_hash})

      //save each shard and associated encryption_key, parallelize them
      let promises = [];
      for(let i = 0; i < shards.length;i++){
        // promises.push(new Promise(async (resolve,reject)=>{
          let {encryption_key, encrypted_file} = shards[i];
          let encryption_key_id = await this.fetch.saveEncryptionKey(encryption_key);
          let cid = await storeWithProgress(WEB3_STORAGE_URL,[encrypted_file]);
          await this.fetch.saveFileShard({file_id, cid, encryption_key_id, index:i});
          // resolve(true);
        // }));
      }
      await Promise.all(promises);
      return file_id
    }
    catch(err){
      console.log({err});
      throw new Error(err);
    }
  }

  /**
   * It decrypts a file.
   * @param id - The id of the file you want to download
   * @returns A decrypted file
   */
export async function decryptFile(file_id){
  try {
    let {file_shards, name, type} = await this.fetch.retrieveFile(file_id);

    //decrypt each shard
    let promises = [];
    for(let i = 0; i < file_shards.length;i++){
      promises.push(new Promise(async (resolve,reject)=>{
        let {encryption_key, cid} = file_shards[i];
        encryption_key = encryption_key.key;
        let encrypted_file = await retrieveFiles(WEB3_STORAGE_URL, cid);
        try {
          let decrypted_file = await decryptShard(encrypted_file, encryption_key);
          resolve(decrypted_file);
        }
        catch(err){
          console.log({err});
          reject(err);
        }
      }));
    }
    let decrypted_shards = await Promise.all(promises);
    
    //recombine the decrypted shards
    let combinedFile = combineUint8Arrays(decrypted_shards);

    let decrypted_file = new File([combinedFile],name,{type});
    return decrypted_file
  } 
  catch(err){
    console.log({err});
    throw new Error(err);
  }
}

/**
 * It returns all the file associations for the respective user
 * @returns An array of files.
 */
export async function getFiles() {
  try {
    let data = await this.fetch.retrieveFiles();
    return data;
  }
  catch(err){
    console.log({err});
    throw new Error(err);
  }
}

