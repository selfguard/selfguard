import { encrypt } from '@metamask/eth-sig-util';
import ascii85 from 'ascii85';

export async function getPublicKey(){
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });
  // Key is returned as base64
  const keyB64 = await window.ethereum.request({
    method: 'eth_getEncryptionPublicKey',
    params: [accounts[0]],
  });

  const publicKey = Buffer.from(keyB64, 'base64');
  return {publicKey,account:accounts[0]}
}

export async function encryptData(data, {publicKey,account}) {
  try {
    if(!publicKey) {
      obj = await getPublicKey();
      publicKey = obj.publicKey;
      account = obcj.account;
    }
    // Returned object contains 4 properties: version, ephemPublicKey, nonce, ciphertext
    // Each contains data encoded using base64, version is always the same string
    const enc = encrypt({
      publicKey: publicKey.toString('base64'),
      data: ascii85.encode(data).toString(),
      version: 'x25519-xsalsa20-poly1305',
    });
  
    // We want to store the data in smart contract, therefore we concatenate them
    // into single Buffer
    const buf = Buffer.concat([
      Buffer.from(enc.ephemPublicKey, 'base64'),
      Buffer.from(enc.nonce, 'base64'),
      Buffer.from(enc.ciphertext, 'base64'),
    ]);
    
    return {metamask_address:account,ciphertext:buf.toString('hex')}
  }
  catch(err){
    console.log(err);
    throw new Error(err);
  }
}

export async function decryptData(account, data) {
  try{
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    data = Buffer.from(data,"hex");
    // Reconstructing the original object outputed by encryption
    const structuredData = {
      version: 'x25519-xsalsa20-poly1305',
      ephemPublicKey: data.slice(0, 32).toString('base64'),
      nonce: data.slice(32, 56).toString('base64'),
      ciphertext: data.slice(56).toString('base64'),
    };
    // Convert data to hex string required by MetaMask
    const ct = `0x${Buffer.from(JSON.stringify(structuredData), 'utf8').toString('hex')}`;
    // Send request to MetaMask to decrypt the ciphertext
    // Once again application must have acces to the account
    const decrypt = await window.ethereum.request({
      method: 'eth_decrypt',
      params: [ct, account],
    });
    // Decode the base85 to final bytes
    return ascii85.decode(decrypt);
  }
  catch(err) {
    console.log(err);
    throw new Error(err.message);
  }
}