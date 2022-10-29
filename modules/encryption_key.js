import {saveLitEncryptionKey, getLitEncryptionKey} from '../helpers/lit.js';
import QuickEncrypt from 'quick-encrypt';
import { v4 as uuidv4 } from 'uuid';

export async function encryptEncryptionKey(encryption_key) {

  let id = uuidv4();

  //if metamask, encrypt the key with lit
  if(this.public_key === 'metamask') {
    let key = await saveLitEncryptionKey(encryption_key);
    return {
      id,
      key,
      lit_enabled: true,
      wallet_type: 'metamask',
      wallet_address : window.ethereum.selectedAddress
    }
  }
  //else encrypt the encryption key using asymmetric encryption
  else if(this.public_key) {
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
    if(wallet_address === window.ethereum.selectedAddress) {
      key = await getLitEncryptionKey(key);
    }
  }
  
  return key;
}