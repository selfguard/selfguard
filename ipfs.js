import { Web3Storage } from 'web3.storage';

function makeStorageClient (token) {
  return new Web3Storage({ token })
}

export async function retrieveFiles (token,cid) {
  const client = makeStorageClient(token)
  const res = await client.get(cid)

  if (!res.ok) {
    throw new Error(`failed to get ${cid} - [${res.status}] ${res.statusText}`)
  }
  // unpack File objects from the response
  const files = await res.files()
  let file = files[0];
  // let fileText = await file.text();
  return file;
}

export async function calculateFileHash(file){
  return new Promise((resolve,reject)=>{
    var reader = new FileReader();
    reader.onload = async function(ev) {
        try {
          let hashBuffer = await crypto.subtle.digest('SHA-256', ev.target.result);
            // Convert hex to hash, see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
          resolve(hashHex);
        }
        catch(err){
          console.log({err});
          reject(err);
        }
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function storeWithProgress (token,files) {
  return new Promise((resolve,reject)=>{
    // when each chunk is stored, update the percentage complete and display
    const totalSize = files.map(f => f.size).reduce((a, b) => a + b, 0)
    let uploaded = 0

    // show the root cid as soon as it's ready
    const onRootCidReady = async (cid) => {
      resolve(cid);
      // setCid(cid);
    }

    const onStoredChunk = async (size) => {
      uploaded += size
      const pct = 100 * (uploaded / totalSize)
      // setProgress(pct > 100 ? 100 : pct);
      if(pct >= 100){
        // setFileName(null);
      }
    }
    const client = makeStorageClient(token)
    return client.put(files, { onRootCidReady, onStoredChunk })
  });
}