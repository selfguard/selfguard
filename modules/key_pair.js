import { ethers } from "ethers";
import QuickEncrypt from 'quick-encrypt';

/**
 * It creates a random key pair of the type specified
 * @param type - The type of keypair to generate. Currently only supports 'ecdsa' and 'rsa'.
 * @returns An object with a public key and a private key.
 */
export function createKeyPair(type){
    try {
        if(type === 'ecdsa'){
        let wallet = ethers.Wallet.createRandom();
        return {
            public_key: wallet.publicKey,
            private_key: wallet.privateKey
        }
        }
        else {
        let keys = QuickEncrypt.generate(1024);
        return {
            public_key:keys.public,
            private_key:keys.private
        };
        }
    }
    catch(err){
        console.log({err});
        throw new Error(err);
    }
}


/**
 * It retrieves the key pairs from the database.
 * @returns An array of key pairs.
 */
export async function getKeyPairs(){
    try {
        let data = await this.fetch.retrieveKeyPairs();
        return data;
    }
    catch(err){
        console.log({err});
        throw new Error(err);
    }
}

 /**
  * It takes a public key and a private key, encrypts the private key with a password, and then saves
  * the public key and encrypted private key to the database
  * @param password - The password you want to use to encrypt your private key.
  * @returns A boolean value of true if the keypair was successfully saved
  */
export async function uploadKeyPair({public_key, private_key}, password){
    try {
    let encrypted_private_key = this.encryptWithPassword(private_key,password);
    await this.fetch.saveKeyPair({public_key, encrypted_private_key});
    return true;
    }
    catch(err){
        console.log({err});
        throw new Error(err);
    }
}