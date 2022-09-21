import { Web3Storage } from 'web3.storage';
import {Crypto} from '@peculiar/webcrypto';
let crypto = new Crypto();

function makeStorageClient (token) {
  return new Web3Storage({ token })
}

/**
 * It takes a token and a cid, and returns a file
 * @param token - the token you got from the login function
 * @param cid - The CID of the file you want to retrieve.
 * @returns A file object
 */
export async function retrieveFiles (token,cid) {
  const client = makeStorageClient(token)
  const res = await client.get(cid)

  if (!res.ok) {
    throw new Error(`failed to get ${cid} - [${res.status}] ${res.statusText}`)
  }
  // unpack File objects from the response
  const files = await res.files()
  let file = files[0];
  return file;
}

/**
 * It takes a file, reads it into memory, and then calculates the SHA-256 hash of the file
 * @param file - The file to be hashed.
 * @returns A promise that resolves to a hex string.
 */
export async function calculateFileHash(file){
  return new Promise(async (resolve,reject)=>{
    let rawFileBytes = await file.arrayBuffer();
    let hashBuffer = await crypto.subtle.digest('SHA-256',rawFileBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    resolve(hashHex);
  });
}

/**
 * It takes a token and a list of files, and returns a promise that resolves to the root CID of the
 * stored data
 * @param token - The token you got from the web3.storage
 * @param files - an array of files to store
 * @returns A promise that resolves to the root cid of the file.
 */
export async function storeWithProgress (token,files) {
  return new Promise((resolve,reject)=>{
    // when each chunk is stored, update the percentage complete and display
    const totalSize = files.map(f => f.size).reduce((a, b) => a + b, 0)
    let uploaded = 0

    // show the root cid as soon as it's ready
    const onRootCidReady = async (cid) => {
      resolve(cid);
    }

    const onStoredChunk = async (size) => {
      uploaded += size
      const pct = 100 * (uploaded / totalSize)
    }
    const client = makeStorageClient(token)
    return client.put(files, { onRootCidReady, onStoredChunk })
  });
}