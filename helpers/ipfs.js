// import { Web3Storage } from "web3.storage";
import { Crypto } from "@peculiar/webcrypto";
let crypto = new Crypto();
import {downloadProgress, uploadProgress} from './updownload';

export async function retrieveIPFSFile(cid, callback) {
  let data = await downloadProgress(`https://${cid}.ipfs.w3s.link/`,(uploaded)=>{
    callback(uploaded);
  });
  return new Blob([data]);
}

export async function storeIPFSFile(file, callback) {
  let token = await this.fetch.getIPFSAPIKey({file_size:file.size});

  let headers = {
    "Authorization": "Bearer " + token,
    "X-NAME": file.name.replaceAll(' ','%20')
  };

  let result = await uploadProgress('https://api.web3.storage/upload',headers, file, (uploaded)=> {
    callback(uploaded);
  });

  callback(null, (100))
  return result.data.cid;
}

/**
 * It takes a file, reads it into memory, and then calculates the SHA-256 hash of the file
 * @param file - The file to be hashed.
 * @returns A promise that resolves to a hex string.
 */
export async function calculateFileHash(file) {
  return new Promise(async (resolve, reject) => {
    let rawFileBytes = await file.arrayBuffer();
    let hashBuffer = await crypto.subtle.digest("SHA-256", rawFileBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""); // convert bytes to hex string
    resolve(hashHex);
  });
}
