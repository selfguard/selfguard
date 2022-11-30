import {storeIPFSFile, calculateFileHash, retrieveIPFSFile, } from '../helpers/ipfs.js';
import {uploadR2, retrieveR2File} from '../helpers/r2.js';
import {decryptBytes, streamEncryptWeb} from '../helpers/encryption.js';
import { v4 as uuidv4 } from 'uuid';

 /**
  * It takes a file, splits it into shards, encrypts each shard, and uploads them to IPFS
  * @param file - the file to be encrypted
  * @returns The file id associating all the shards is being returned.
  */
export async function encryptFile(file, callback, metadata){
  try {
    //if file too big, throw an error
    if(file.size > 100*1000*1000) throw new Error('File size must be less than 100 MB');

    //save file assocation for each shard
    let document_hash = await calculateFileHash(file);

    let file_shards = [];
    //iterate through each file chunk that has been encrypted
    let i = 0;
    let size_so_far = 0;
    let totalSize = 0;
    let file_id = uuidv4();

    if(!metadata) metadata = 'raw_r2_upload';

    let name = file.name.replaceAll(`’`,'');

    await streamEncryptWeb(file, async (encrypted_bytes, encryption_key, chunkLength)=>{

      // //save the file to ipfs
      let encrypted_file = new File([encrypted_bytes],name,{type:file.type});

      let cid = '';

      let callbackF = (uploaded) => {
        if(uploaded){
          let totalUploaded = (100*(size_so_far + (uploaded/encrypted_file.size)*chunkLength)/file.size).toFixed(2)
          if(parseInt(totalUploaded) === 100) totalUploaded = 99.99;
          callback(null, totalUploaded);
        }
      }

      if(metadata === 'raw_r2_upload'){
        cid = await uploadR2.call(this, encrypted_file, callbackF);
      }
      else {
        metadata = 'raw_ipfs_upload';
        cid = await storeIPFSFile.call(this, encrypted_file, callbackF);
      }

      totalSize += encrypted_bytes.byteLength;
      
      //encrypt the encryption key 
      let encryption_instance = await this.encryptEncryptionKey(encryption_key,'file');

      //append to list of file shards
      file_shards.push({cid, index:i, encryption_instance, metadata});

      size_so_far += chunkLength;
      i++;
    });

    await this.fetch.saveFile({id:file_id,size: totalSize, name, type:file.type, document_hash, file_shards})

    callback(null, 100);

    return {
      file_shards,
      document_hash,
      id:file_id,
      created_at: Date.now(),
      type: file.type,
      size: totalSize,
      name
    }
  }
  catch(err){
    console.log({err});
    throw new Error(err);
  }
}

export async function retrieveFileShareData(file_id) {
  try {
    return await this.fetch.retrieveFileShareData(file_id);
  }
  catch(err){
    console.log({err});
    throw new Error(err);
  }
}

export async function getRawFile(file_id) {
  try {
    let {file_shards} = await this.fetch.retrieveFile(file_id);
    let {cid, metadata} = file_shards[0];
    //retrieve the file
    let encrypted_file = metadata === 'raw_r2_upload' ? await retrieveR2File.call(this, cid, ()=>{}) : await retrieveIPFSFile.call(this, cid, ()=>{});
    return encrypted_file;
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
    let {file_shards, name, type, size} = await this.fetch.retrieveFile(file_id);
    //decrypt each shard
    let decrypted_shards = [];
    let downloadedSoFar = 0;
    // let encryption_keys = [];


    //promise all to decrypt all encryption keys within file shards
    let _this = this;
    let encryption_keys = await Promise.all(file_shards.map(({encryption_instance})=>{
      return new Promise(async (resolve,_)=>{
        let encryption_key = await _this.decryptEncryptionKey(encryption_instance.encryption_keys[0]);
        resolve(encryption_key);
      })
    }));

    for(let i = 0; i < file_shards.length;i++){
        try {
          let {cid, metadata} = file_shards[i];

          let so_far = downloadedSoFar;

          let callbackF = (downloaded)=>{
            let totalDownloaded = (100* ((so_far+downloaded)/size)).toFixed(2);
            if(parseInt(totalDownloaded) === 100) totalDownloaded = 99.99;
            callback(null, totalDownloaded);
          }

          //retrieve the file
          let encrypted_file = metadata === 'raw_r2_upload' ? await retrieveR2File.call(this, cid, callbackF) : await retrieveIPFSFile.call(this, cid, callbackF);
          downloadedSoFar += encrypted_file.size;

          //decrypt the shard
          let encrypted_bytes = await encrypted_file.arrayBuffer();

          let decrypted_shard = await decryptBytes(encrypted_bytes, encryption_keys[i]);
          decrypted_shards.push(decrypted_shard);
        }
        catch(err){
          console.log({err});
          throw new Error(err);
        }
    }

    try {
      let file = new File(decrypted_shards,name,{type});
      callback(null, 100);
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

export async function getTotalFileSizeUploaded(){
  return await this.fetch.getTotalFileSizeUploaded();
}

