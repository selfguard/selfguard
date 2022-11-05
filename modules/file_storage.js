import {storeWithProgress, calculateFileHash, retrieveIPFSFile} from '../helpers/ipfs.js';
import {decryptBytes, streamEncryptWeb} from '../helpers/encryption.js';
import { v4 as uuidv4 } from 'uuid';

 /**
  * It takes a file, splits it into shards, encrypts each shard, and uploads them to IPFS
  * @param file - the file to be encrypted
  * @returns The file id associating all the shards is being returned.
  */
 export async function encryptFile(file, callback){
    try {
      //if file too big, throw an error
      if(file.size > 100*1000*1000) throw new Error('File size must be less than 100 MB');

      let WEB3_STORAGE_KEY = await this.fetch.getIPFSAPIKey();

      //save file assocation for each shard
      let document_hash = await calculateFileHash(file);

      let file_shards = [];
      let totalSize = file.size;
      //iterate through each file chunk that has been encrypted
      let i = 0;
      let size_so_far = 0;
      let file_id = uuidv4();
      await streamEncryptWeb(file, async (encrypted_bytes, encryption_key, chunkLength)=>{

        // //save the file to ipfs
        let encrypted_file = new File([encrypted_bytes],file.name,{type:file.type});
        let cid = await storeWithProgress(WEB3_STORAGE_KEY,encrypted_file, size_so_far/totalSize, totalSize, chunkLength, callback);
       
        //encrypt the encryption key 
        let encryption_instance = await this.encryptEncryptionKey(encryption_key,'file');

        //append to list of file shards
        file_shards.push({cid, index:i, encryption_instance, metadata:'raw_ipfs_upload'});

        size_so_far+=chunkLength;
        i++;
      })
      await this.fetch.saveFileAssociation({id:file_id,size: totalSize, name:file.name, type:file.type, document_hash, file_shards})

      return {
        file_shards,
        document_hash,
        id:file_id,
        created_at: Date.now(),
        type: file.type,
        size: totalSize,
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
          let {encryption_instance, cid, metadata} = file_shards[i];

          //retrieve the file
          let encrypted_file = await retrieveIPFSFile(cid, name, type, metadata);

          //callback with progress
          if(typeof callback === 'function') callback(null, Math.floor((i+1)/file_shards.length*100))

          //decrypt the encryption _key
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

