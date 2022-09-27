import { Web3Storage } from "web3.storage";
import { Crypto } from "@peculiar/webcrypto";
let crypto = new Crypto();
import axios from "axios";
import { Blob } from "fetch-blob";
import { File } from "fetch-blob/file.js";

function makeStorageClient(token) {
  return new Web3Storage({ token });
}

/**
 * It takes a token and a cid, and returns a file
 * @param token - the token you got from the login function
 * @param cid - The CID of the file you want to retrieve.
 * @returns A file object
 */
export async function retrieveFiles(token, cid, name, type) {
  try {
    let res = await axios.get(
      `https://${cid}.ipfs.w3s.link/ipfs/${cid}/${name}`,
      {
        headers: {
          Accept: type,
        },
        responseType: "arraybuffer",
      }
    );
    let file = new Blob([res.data]);
    return file;
  }
  catch (e) {
    throw new Error(`Failed to retrieve ${cid}`);
  }
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

/**
 * It takes a token and a list of files, and returns a promise that resolves to the root CID of the
 * stored data
 * @param token - The token you got from the web3.storage
 * @param files - an array of files to store
 * @returns A promise that resolves to the root cid of the file.
 */
export async function storeWithProgress(token, files, finishedSoFar, fileSize, callback) {
  return new Promise((resolve, reject) => {
    let cid = null;
    // when each chunk is stored, update the percentage complete and display
    const totalSize = files.map((f) => f.size).reduce((a, b) => a + b, 0);
    let uploaded = 0;

    // show the root cid as soon as it's ready
    const onRootCidReady = async (c) => {
      cid = c;
    };

    const onStoredChunk = async (size) => {
      uploaded += size;
      if(typeof callback === 'function') callback(null, Math.floor(100*(finishedSoFar + uploaded/fileSize)));
      const pct = (uploaded / totalSize);
      if(pct >= 1) resolve(cid);
    };
    const client = makeStorageClient(token);
    return client.put(files, { onRootCidReady, onStoredChunk });
  });
}
