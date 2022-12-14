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

export async function encryptEncryptionKey(encryption_key, type, address) {
  try {
    let id = uuidv4();

    if(type === 'profile' || type === 'file-link'){
      return {
        id,
        type,
        no_encryption: true,
        key: encryption_key
      }
    }
  
    //for when a user doesnt have a account yet
    if(address === 'not-activated'){
      return {
        id,
        type,
        no_encryption: true,
        key: encryption_key
      }
    }
  
    if(address){
      let key = await saveLitEncryptionKey(encryption_key,'ethereum', null, address);
      return {
        id,
        key,
        type,
        lit_enabled: true,
        wallet_type: 'metamask',
        lit_chain: 'ethereum',
        wallet_address : address
      }
    }
  
    //if metamask, encrypt the key with lit
    else if(this.key_pair_type === 'metamask') {
      let key = await saveLitEncryptionKey(encryption_key);
      return {
        id,
        key,
        type,
        lit_enabled: true,
        lit_chain: 'ethereum',
        wallet_type: 'metamask',
        wallet_address : window.ethereum.selectedAddress
      }
    }
    else if(this.key_pair_type === 'ecdsa') {
      //create auth sig and pass to save lit encryption key
      let authSig = await createAuthSig(this.private_key);
      let key = await saveLitEncryptionKey(encryption_key, 'ethereum', authSig);

      let address = ethers.utils.computeAddress(this.public_key);

      return {
        id,
        key,
        type,
        lit_enabled: true,
        lit_chain: 'ethereum',
        wallet_type: 'selfguard,ecdsa',
        public_key : address
      }
    }
    //else encrypt the encryption key using asymmetric encryption
    else if(this.key_pair_type === 'rsa') {
      encryption_key = QuickEncrypt.encrypt(encryption_key, this.public_key) // wrap with public key
      
      return {
        id,
        type,
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
        type,
        no_encryption: true,
        key: encryption_key
      }
    }
  }
  catch(err){
    console.log({err});
    throw new Error(err);
  }
}

export async function decryptEncryptionKey(encrypted_encryption_key_object) {
  try {
    let {wallet_type, wallet_address,lit_chain, asymmetrically_encrypted, public_key, lit_enabled, no_encryption, asymmetric_encryption_type, key} = encrypted_encryption_key_object;

    if(asymmetrically_encrypted) {
      if(wallet_type === 'selfguard,rsa' && asymmetric_encryption_type === 'rsa') {
        if(public_key === this.public_key){
          key = QuickEncrypt.decrypt(key, this.private_key)
        }
      }
    }

    if(lit_enabled){
      let address = this.key_pair_type === 'ecdsa' ? ethers.utils.computeAddress(this.public_key) : null;

      if(wallet_type === 'metamask' && this.key_pair_type === 'metamask' && wallet_address.toLowerCase() === window.ethereum.selectedAddress.toLowerCase()) {
        key = await getLitEncryptionKey(key, lit_chain);
      }
      else if(wallet_type === 'selfguard,ecdsa' && public_key.toLowerCase() === address.toLowerCase()) {
        //get Lit encryption key with manual auth sig
        let authSig = await createAuthSig(this.private_key);
        key = await getLitEncryptionKey(key, lit_chain, authSig);
      }
    }
    
    return key;
  }
  catch(err){
    console.log({err});
    throw new Error(err);
  }
}