import {storeWithProgress, calculateFileHash, retrieveFiles} from '../helpers/ipfs.js';
import {decryptShard, streamEncryptWeb} from '../helpers/encryption.js';
import {File} from 'fetch-blob/file.js'

let WEB3_STORAGE_URL = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDQxRjQ1QTY3NDQzRGJDNmQ3N0NEOThFYjJDZDVFZThERjRDMTlCYjciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTg5NTI4NTYxOTksIm5hbWUiOiJ0ZXN0In0.I-fSz9b0Thg3nC5bnHHURoYiaXKHC9E3dcvJM7IdV4A';

 /**
  * It takes a file, splits it into shards, encrypts each shard, and uploads them to IPFS
  * @param file - the file to be encrypted
  * @returns The file id associating all the shards is being returned.
  */
 export async function encryptFile(file, callback){
    try {
      //save file assocation for each shard
      let document_hash = await calculateFileHash(file);
      let file_id = await this.fetch.saveFileAssociation({name:file.name, type:file.type, document_hash})

      let file_shards = [];
      //iterate through each file chunk that has been encrypted
      let i = 0;
      let size_so_far = 0;
      await streamEncryptWeb(file, async (encrypted_bytes, encryption_key)=>{
         // save the encryption key with SelfGuard
        let encryption_key_id = await this.fetch.saveEncryptionKey(encryption_key);

        //save the file to ipfs
        let encrypted_file = new File([encrypted_bytes],file.name,{type:file.type});
        let cid = await storeWithProgress(WEB3_STORAGE_URL,[encrypted_file], size_so_far/file.size, file.size, callback);

        //save the file shard assocation with SelfGuard
        await this.fetch.saveFileShard({file_id, cid, encryption_key_id, index:i, name:file.name});

        size_so_far+=encrypted_bytes.byteLength;
        file_shards.push({cid});
        i++;
      })

      return {
        file_shards,
        document_hash,
        id:file_id,
        created_at: Date.now(),
        type: file.type,
        name: file.name
      }
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
export async function decryptFile(file_id, callback){
  try {
    let {file_shards, name, type} = await this.fetch.retrieveFile(file_id);
    //decrypt each shard
    let decrypted_shards = [];
    for(let i = 0; i < file_shards.length;i++){
        try {
          let {encryption_key, cid} = file_shards[i];
          encryption_key = encryption_key.key;
          let encrypted_file = await retrieveFiles(WEB3_STORAGE_URL, cid, name, type);
          if(typeof callback === 'function') callback(null, Math.floor((i+1)/file_shards.length*100))
          let decrypted_shard = await decryptShard(encrypted_file, encryption_key);
          decrypted_shards.push(decrypted_shard);
        }
        catch(err){
          console.log({err});
          throw new Error(err);
        }
    }

    try {
      let file = new File(decrypted_shards,name,{name,type});
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

export async function getFileEncryptionKeys(file_id) {
  try {
    let {file_shards} = await this.fetch.retrieveFile(file_id);
    return file_shards;
  }
  catch(err){
    console.log({err});
    throw new Error(err);
  }
}

