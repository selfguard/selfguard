import {Crypto} from '@peculiar/webcrypto';
import { generateFileBufferSlices } from './stream_files.js';
import QuickEncrypt from 'quick-encrypt';
import {saveLitEncryptionKey, getLitEncryptionKey} from './lit.js';

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
export async function encryptBytes(plaintextbytes){
	try {
		let {ivbytes, key, passphrase, pbkdf2salt} = await generateEncryptionKey();
		var cipherbytes= await crypto.subtle.encrypt({name: "AES-CBC", iv: ivbytes}, key, plaintextbytes).catch(function(err){});

		if(!cipherbytes) return;

		cipherbytes = new Uint8Array(cipherbytes);
		var encrypted_bytes = new Uint8Array(cipherbytes.length+16)
		encrypted_bytes.set(new TextEncoder("utf-8").encode('Salted__'));
		encrypted_bytes.set(pbkdf2salt, 8);
		encrypted_bytes.set(cipherbytes, 16);

		return {encrypted_bytes, encryption_key: passphrase}
	}
	catch(err){
		console.log({err});
	}
	return null;
}

/**
 * It takes a value, encrypts it, and returns the encrypted value and the encryption key
 * @param value - The value to be encrypted.
 * @returns An object with two properties: encrypted_value and encryption_key.
 */
export async function encryptValue(value){
	//convert string to bytes
	let plaintextbytes = new TextEncoder('utf-8').encode(value);

	//encrypt the bytes
	let {encryption_key, encrypted_bytes} = await encryptBytes(plaintextbytes); 

	let ciphertext = Buffer.from(encrypted_bytes).toString('hex');
	return {ciphertext, encryption_key};
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
export async function decryptShard(objFile, encryption_key, pub_key) {
	if(pub_key === 'metamask') encryption_key = await getLitEncryptionKey(encryption_key);
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

export async function streamEncryptWeb(file,public_key, chunk_function){
	//minimum 5 chunks for the file, if the file is over 300MB, set each chunk to 100MB.  
	let chunk_size = file.size > 100*1000*1000 ? 100*1000*1000 : file.size;

	for await(const slice of generateFileBufferSlices(file, chunk_size)) {
		//encrypt shard
		let {encryption_key, encrypted_bytes} = await encryptBytes(slice);
		if(public_key === 'metamask') encryption_key = await saveLitEncryptionKey(encryption_key);

		//run the chunk function on the data
		await chunk_function(encrypted_bytes, encryption_key, slice.byteLength);
	}
	return;
}
