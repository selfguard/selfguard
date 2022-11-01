import {saveLitEncryptionKey, getLitEncryptionKey} from '../helpers/lit.js';
import QuickEncrypt from 'quick-encrypt';
import { v4 as uuidv4 } from 'uuid';
import { ethers } from "ethers";
import siwe from 'siwe';

//TODO - ensure this is compatible with selfguard-node
function createSiweMessage (address) {
  const siweMessage = new siwe.SiweMessage({
    domain: window.location.host,
    address,
    statement: window.location.origin + 'would like to use your wallet to encrypt this encryption key on your behalf',
    uri: window.location.origin,
    version: '1',
    chainId: '1'
  });
  return siweMessage.prepareMessage();
}

async function createAuthSig(private_key) {
  let wallet = new ethers.Wallet(private_key);
  let address = wallet.address;
  let signedMessage = createSiweMessage(address);
  let sig = await wallet.signMessage(signedMessage);
  return {
    sig, 
    derivedVia: "ethers.js sign message",
    signedMessage,
    address
  }
}

export async function encryptEncryptionKey(encryption_key, basic) {

  let id = uuidv4();

  if(basic){
    return {
      id,
      no_encryption: true,
      key: encryption_key
    }
  }

  //if metamask, encrypt the key with lit
  if(this.key_pair_type === 'metamask') {
    let key = await saveLitEncryptionKey(encryption_key);
    return {
      id,
      key,
      lit_enabled: true,
      wallet_type: 'metamask',
      wallet_address : window.ethereum.selectedAddress
    }
  }
  else if(this.key_pair_type === 'ecdsa') {
    //create auth sig and pass to save lit encryption key
    let authSig = await createAuthSig(this.private_key);
    let key = await saveLitEncryptionKey(encryption_key, 'ropsten', authSig);
    return {
      id,
      key,
      lit_enabled: true,
      wallet_type: 'selfguard,ecdsa',
      public_key : this.public_key
    }
  }
  //else encrypt the encryption key using asymmetric encryption
  else if(this.key_pair_type === 'rsa') {
    encryption_key = QuickEncrypt.encrypt(encryption_key, this.public_key) // wrap with public key
    return {
      id,
      public_key: this.public_key,
      asymmetrically_encrypted: true,
      asymmetric_encryption_type: 'rsa',
      wallet_type: 'selfguard,rsa',
      key: encryption_key
    }
  }
  // else just save the encryption key as is
  else {
    return {
      id,
      no_encryption: true,
      key: encryption_key
    }
  }
}

export async function decryptEncryptionKey(encrypted_encryption_key_object) {
  let {wallet_type, wallet_address, asymmetrically_encrypted, public_key, lit_enabled, no_encryption, asymmetric_encryption_type, key} = encrypted_encryption_key_object;
  
  if(asymmetrically_encrypted) {
    if(wallet_type === 'selfguard,rsa' && asymmetric_encryption_type === 'rsa') {
      if(public_key === this.public_key){
        key = QuickEncrypt.decrypt(key, this.private_key)
      }
    }
  }

  if(lit_enabled){
    if(wallet_type === 'metamask' && this.key_pair_type === 'metamask' && wallet_address === window.ethereum.selectedAddress) {
      key = await getLitEncryptionKey(key);
    }
    if(wallet_type === 'selfguard,ecdsa' && public_key === this.public_key) {
      //get Lit encryption key with manual auth sig
      let authSig = await createAuthSig(this.private_key);
      key = await getLitEncryptionKey(key,'ropsten', authSig);
    }
  }
  
  return key;
}