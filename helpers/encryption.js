import {Crypto} from '@peculiar/webcrypto';
import { File } from 'fetch-blob/file.js';
import QuickEncrypt from 'quick-encrypt';

let crypto = new Crypto();
var pbkdf2iterations=10000;

/**
 * It takes a salt, a passphrase, and a type of key to import, and returns an AES key, an IV, and
 * the PBKDF2 bytes
 * @param pbkdf2salt - A random salt used to derive the key.
 * @param passphrase - The passphrase that will be used to derive the key.
 * @param type - 'encrypt' or 'decrypt'
 * @returns The key, ivbytes, and pbkdf2bytes are being returned.
 */
async function extractKeyBytes(pbkdf2salt, passphrase, type){
	try {
		var passphrasebytes = new TextEncoder("utf-8").encode(passphrase);
		var passphrasekey = await crypto.subtle.importKey('raw', passphrasebytes, {name: 'PBKDF2'}, false, ['deriveBits']).catch(function(err){});
		var pbkdf2bytes = await crypto.subtle.deriveBits({"name": 'PBKDF2', "salt": pbkdf2salt, "iterations": pbkdf2iterations, "hash": 'SHA-256'}, passphrasekey, 384).catch(function(err){});
		pbkdf2bytes = new Uint8Array(pbkdf2bytes);
		let keybytes=pbkdf2bytes.slice(0,32);
		let ivbytes=pbkdf2bytes.slice(32);
		var key = await crypto.subtle.importKey('raw', keybytes, {name: 'AES-CBC', length: 256}, false, [type]);
		return {key,ivbytes,pbkdf2bytes}
	}
	catch(err){
		console.log({err});
	}
}


/**
 * It generates a random 256 bit key and the corresponding iv bytes and salt
 * @returns An object with the following properties:
 * 	ivbytes: a Uint8Array of 16 bytes
 * 	key: a CryptoKey
 * 	passphrase: a string
 * 	pbkdf2salt: a Uint8Array of 8 bytes
 */
async function generateEncryptionKey(){
	let key1 = await crypto.subtle.generateKey({name: "AES-CBC",length: 256},true,["encrypt", "decrypt"]);
	let bytes1 = await crypto.subtle.exportKey('raw',key1);
	let passphrase = Buffer.from(bytes1).toString('hex')

	let pbkdf2salt = crypto.getRandomValues(new Uint8Array(8));
	let {key, ivbytes} = await extractKeyBytes(pbkdf2salt, passphrase, 'encrypt');
	return {ivbytes, key, passphrase, pbkdf2salt};
}

/**
 * It takes a plaintext, a key, and an initialization vector, and returns the encrypted ciphertext
 * @param plaintextbytes - The bytes of the plaintext to be encrypted.
 * @returns The encrypted bytes.
 */
async function encryptBytes(plaintextbytes, {ivbytes, key, passphrase, pbkdf2salt}){
	try {
		var cipherbytes= await crypto.subtle.encrypt({name: "AES-CBC", iv: ivbytes}, key, plaintextbytes).catch(function(err){});

		if(!cipherbytes) return;

		cipherbytes = new Uint8Array(cipherbytes);
		var resultbytes=new Uint8Array(cipherbytes.length+16)
		resultbytes.set(new TextEncoder("utf-8").encode('Salted__'));
		resultbytes.set(pbkdf2salt, 8);
		resultbytes.set(cipherbytes, 16);

		return resultbytes;
	}
	catch(err){
		console.log({err});
	}
	return null;
}

/**
 * It takes a file, encrypts it, and returns the encrypted file and the encryption key
 * @param objFile - The file object that you want to encrypt.
 * @returns A blob object, the encryption key, and the encrypted name
 */
export async function shardEncryptFile(objFile, numShards) {


	//handle number of shards
	if(!numShards || isNaN(numShards)) numShards = 1;
	if(parseInt(numShards) > 10) numShards = 10;
	
	//read in file
	let rawFileBytes = await objFile.arrayBuffer();


	//calculat the length of each shard
	let shardLength = Math.min(rawFileBytes.byteLength / numShards);

	//split into shards
	let shards = [];
	
	for(let i = 0; i < numShards; i++) {
		//build shard
		let start = i * shardLength;

		//if we are at the last shard, ensure its length goes until the end of the array
		let end = i <= numShards - 1 ? start + shardLength : rawFileBytes.byteLength;
		let shardBytes = rawFileBytes.slice(start, end);
		
		//encrypt shard
		let keys = await generateEncryptionKey();
		let encrypted_shard_bytes = await encryptBytes(shardBytes, keys); 
		var encrypted_file = new File([encrypted_shard_bytes], objFile.name, {type: objFile.type});

		shards.push({encrypted_file, encryption_key: keys.passphrase});
	}
	return shards;
}

/**
 * It takes a value, encrypts it, and returns the encrypted value and the encryption key
 * @param value - The value to be encrypted.
 * @returns An object with two properties: encrypted_value and encryption_key.
 */
export async function encryptValue(value){
	let plaintextbytes = new TextEncoder('utf-8').encode(value);

	let keys = await generateEncryptionKey();
	let resultbytes = await encryptBytes(plaintextbytes,keys);

	let ciphertext = Buffer.from(resultbytes).toString('hex');
	return {ciphertext, encryption_key: keys.passphrase};
}

/**
 * It takes a byte array, extracts the salt and ciphertext, derives the key from the passphrase,
 * decrypts the ciphertext, and returns the plaintext
 * @param bytes - the bytes to decrypt
 * @param passphrase - The passphrase used to encrypt the data.
 * @returns The plaintext bytes.
 */
export async function decryptBytes(bytes, encryption_key){
	var pbkdf2salt = bytes.slice(8,16);
	let cipherbytes = bytes.slice(16);
	let {key, ivbytes} = await extractKeyBytes(pbkdf2salt, encryption_key, 'decrypt');
	var plaintextbytes = await crypto.subtle.decrypt({name: "AES-CBC", iv: ivbytes}, key, cipherbytes).catch(function(err){});
	if (!plaintextbytes) return;
	return new Uint8Array(plaintextbytes);
}

/**
 * It reads a file, decrypts it, and returns the decrypted bytes
 * @param objFile - The file path to the encrypted shard
 * @param encryption_key - The encryption key used to encrypt the shard.
 * @returns The decrypted bytes of the file.
 */
export async function decryptShard(objFile, encryption_key) {
	var bytes = await objFile.arrayBuffer();
	let decrypted_bytes = await decryptBytes(bytes, encryption_key);
	return decrypted_bytes;
}


/**
 * It takes an encrypted value and an encryption key, decrypts the value, and returns the decrypted
 * value
 * @param encrypted_value - The encrypted value you want to decrypt.
 * @param encryption_key - This encryption key you want to use to decrypt the value.
 * @returns The decrypted value of the encrypted value.
 */
export async function decryptValue(encrypted_value, encryption_key){
	let bytes = hexStringToUint8Array(encrypted_value);
	let plaintextbytes = await decryptBytes(bytes, encryption_key);
	let text = new TextDecoder("utf-8").decode(plaintextbytes);
	return text;
}

export function decryptWithPrivateKey(encryption_key, private_key){
	return QuickEncrypt.decrypt(encryption_key, private_key);
}

/**
 * It takes a hex string and returns a Uint8Array
 * @param hexString - The hex string to convert to a Uint8Array.
 * @returns A Uint8Array
 */
function hexStringToUint8Array(hexString){
  if (hexString.length % 2 !== 0){
    throw new Error("Invalid hexString");
  }
  var arrayBuffer = new Uint8Array(hexString.length / 2);

  for (var i = 0; i < hexString.length; i += 2) {
    var byteValue = parseInt(hexString.substr(i, 2), 16);
    if (isNaN(byteValue)){
      throw new Error("Invalid hexString");
    }
    arrayBuffer[i/2] = byteValue;
  }

  return arrayBuffer;
}

export function combineUint8Arrays(arrays){
	try {
		let array = [];
		for (let i = 0; i < arrays.length; i++) {
			let arr = arrays[i];
			for(let j = 0; j < arr.length; j++) {
				array.push(arr[j])
			}
		}
		return new Uint8Array(array);
	}
	catch (e) {
		console.log(e);
		throw new Error(e);
	}

};

