import {Crypto} from '@peculiar/webcrypto';
let crypto = new Crypto();
var pbkdf2iterations=10000;

/**
 * It reads a file and returns a promise that resolves to the file's contents
 * @param file - The file to read.
 * @returns A promise that resolves to the file contents.
 */
function readfile(file){
	return new Promise((resolve, reject) => {
		var fr = new FileReader();
		fr.onload = () => {
			resolve(fr.result )
		};
		fr.readAsArrayBuffer(file);
	});
}

/**
 * It takes a salt, a passphrase key, and a type of key to import, and returns an AES key, an IV, and
 * the PBKDF2 bytes.
 * @param passphrase - The passphrase that the user entered.
 * @returns The key, ivbytes, and pbkdf2bytes are being returned.
 */
async function extractPassphraseKey(passphrase){
	var passphrasebytes = new TextEncoder("utf-8").encode(passphrase);
	var passphrasekey = await crypto.subtle.importKey('raw', passphrasebytes, {name: 'PBKDF2'}, false, ['deriveBits']).catch(function(err){});
	return passphrasekey
}

/**
 * It takes a salt, a passphrase key, and a type of key to import, and returns an AES key, an IV, and
 * the PBKDF2 bytes
 * @param pbkdf2salt - A random salt used to derive the key.
 * @param passphrasekey - The key derived from the passphrase.
 * @param type - 'encrypt' or 'decrypt'
 * @returns The key, ivbytes, and pbkdf2bytes are being returned.
 */
async function extractKeyBytes(pbkdf2salt, passphrasekey, type){
	try {
		var pbkdf2bytes = await crypto.subtle.deriveBits({"name": 'PBKDF2', "salt": pbkdf2salt, "iterations": pbkdf2iterations, "hash": 'SHA-256'}, passphrasekey, 384).catch(function(err){});
		pbkdf2bytes = new Uint8Array(pbkdf2bytes);
		let keybytes=pbkdf2bytes.slice(0,32);
		let ivbytes=pbkdf2bytes.slice(32);
		var key = await crypto.subtle.importKey('raw', keybytes, {name: 'AES-CBC', length: 256}, false, [type]).catch(function(err){console.log({err})});
		return {key,ivbytes,pbkdf2bytes}
	}
	catch(err){
		console.log({err});
	}
}

/**
 * It takes a byte array and returns an object with two properties: `pbkdf2salt` and `cipherbytes`
 * @param bytes - the bytes of the encrypted file
 * @returns An object with two properties: pbkdf2salt and cipherbytes.
 */
function extractCipherAndSalt(bytes){
	var pbkdf2salt = bytes.slice(8,16);
	let cipherbytes = bytes.slice(16);
	return {pbkdf2salt, cipherbytes}
}


/**
 * It generates a random 256 bit AES key, then uses that key to encrypt a random 8 byte salt, and then
 * uses that salt to encrypt the 256 bit AES key
 * @returns An object with the ivbytes, key, passphrase, and pbkdf2salt.
 */
async function generateEncryptionKey(){
	let key1 = await crypto.subtle.generateKey({name: "AES-CBC",length: 256},true,["encrypt", "decrypt"]);
	let bytes1 = await crypto.subtle.exportKey('raw',key1);
	let passphrase = Buffer.from(bytes1).toString('hex')

	let pbkdf2salt = crypto.getRandomValues(new Uint8Array(8));
	var passphrasekey = await extractPassphraseKey(passphrase);

	let {key, ivbytes} = await extractKeyBytes(pbkdf2salt, passphrasekey, 'encrypt');
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
 * It takes a file, encrypts it, and returns the encrypted file and the passphrase used to encrypt it
 * @param objFile - the file object to be encrypted
 * @returns A blob object and a passphrase.
 */
export async function encryptFile(objFile) {
	let plaintext = await readfile(objFile).catch(function(err){});
	let plaintextbytes = new Uint8Array(plaintext); //raw file
	let filenamebytes = new TextEncoder('utf-8').encode(objFile.name); //filename

	let keys = await generateEncryptionKey();
	let resultbytes = await encryptBytes(plaintextbytes,keys); //encrypt file
	let resultFilebytes = await encryptBytes(filenamebytes,keys); //encrypt filename
	let encryptedName = Buffer.from(resultFilebytes).toString('hex');

	var blob = new Blob([resultbytes], {type: objFile.type});
  return {blob,passphrase:keys.passphrase,encryptedName};
}

/**
 * It takes a string, generates a random encryption key, encrypts the string with that key, and returns
 * the encrypted string and the key
 * @param text - The text to encrypt
 * @returns An object with two properties: encryptedText and passphrase.
 */
export async function encryptText(text){
	let plaintextbytes = new TextEncoder('utf-8').encode(text);

	let keys = await generateEncryptionKey();
	let resultbytes = await encryptBytes(plaintextbytes,keys);

	let encryptedText = Buffer.from(resultbytes).toString('hex');
	return {encryptedText,passphrase:keys.passphrase};
}

/**
 * It takes a string, converts it to bytes, generates an encryption key, encrypts the bytes with the
 * key, and returns the encrypted bytes as a hex string
 * @param value - The value to encrypt.
 * @param encryption_key - This is the key that will be used to encrypt the data. If you don't provide
 * one, it will generate one for you.
 */
export async function encryptWithKey(value, encryption_key){
	let plaintextbytes = new TextEncoder('utf-8').encode(text);

	let keys = options && options.encryption_key ?  options.encryption_key : await generateEncryptionKey();
	let resultbytes = await encryptBytes(plaintextbytes,keys);

	let encryptedText = Buffer.from(resultbytes).toString('hex');
	return {encryptedText,passphrase:keys.passphrase};
}


/**
 * It takes a byte array, extracts the salt and ciphertext, derives the key from the passphrase,
 * decrypts the ciphertext, and returns the plaintext
 * @param bytes - the bytes to decrypt
 * @param passphrase - The passphrase used to encrypt the data.
 * @returns The plaintext bytes.
 */
async function decryptBytes(bytes, passphrase){
	let {pbkdf2salt, cipherbytes} = extractCipherAndSalt(bytes);
	var passphrasekey = await extractPassphraseKey(passphrase);
	let {key, ivbytes} = await extractKeyBytes(pbkdf2salt, passphrasekey, 'decrypt');

	var plaintextbytes = await crypto.subtle.decrypt({name: "AES-CBC", iv: ivbytes}, key, cipherbytes).catch(function(err){});

	if (!plaintextbytes) return;
	return new Uint8Array(plaintextbytes);
}

//decrypt file
/**
 * It reads the file, decrypts it, and returns the decrypted file as a blob
 * @param objFile - The file object that you want to encrypt.
 * @param passphrase - The passphrase used to encrypt the file.
 * @returns A blob object.
 */
export async function decryptFile(objFile,passphrase) {
	var bytes = await readfile(objFile).catch(function(err){});
	bytes = new Uint8Array(bytes);

	let plaintextbytes = await decryptBytes(bytes, passphrase);
	var blob=new Blob([plaintextbytes], {type: objFile.type});
	return blob;
}

/**
 * It takes an encrypted text and a passphrase, converts the encrypted text to bytes, decrypts the
 * bytes, and returns the decrypted text
 * @param encryptedText - The encrypted text you want to decrypt.
 * @param passphrase - The passphrase you want to use to encrypt the text.
 * @returns The decrypted text.
 */
export async function decryptText(encryptedText, passphrase){
	let bytes = new hexStringToUint8Array(encryptedText);
	let plaintextbytes = await decryptBytes(bytes, passphrase);
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

