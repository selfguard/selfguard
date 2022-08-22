var pbkdf2iterations=10000;

function readfile(file){
	return new Promise((resolve, reject) => {
		var fr = new FileReader();
		fr.onload = () => {
			resolve(fr.result )
		};
		fr.readAsArrayBuffer(file);
	});
}

//Extraction
async function extractPassphraseKey(passphrase){
	var passphrasebytes = new TextEncoder("utf-8").encode(passphrase);
	var passphrasekey = await window.crypto.subtle.importKey('raw', passphrasebytes, {name: 'PBKDF2'}, false, ['deriveBits']).catch(function(err){});
	return passphrasekey
}

async function extractKeyBytes(pbkdf2salt, passphrasekey, type){
	try {
		var pbkdf2bytes = await window.crypto.subtle.deriveBits({"name": 'PBKDF2', "salt": pbkdf2salt, "iterations": pbkdf2iterations, "hash": 'SHA-256'}, passphrasekey, 384).catch(function(err){});
		pbkdf2bytes = new Uint8Array(pbkdf2bytes);
		let keybytes=pbkdf2bytes.slice(0,32);
		let ivbytes=pbkdf2bytes.slice(32);
		var key = await window.crypto.subtle.importKey('raw', keybytes, {name: 'AES-CBC', length: 256}, false, [type]).catch(function(err){console.log({err})});
		return {key,ivbytes,pbkdf2bytes}
	}
	catch(err){
		console.log({err});
	}
}

function extractCipherAndSalt(bytes){
	var pbkdf2salt = bytes.slice(8,16);
	let cipherbytes = bytes.slice(16);
	return {pbkdf2salt, cipherbytes}
}


//Generation
async function generateKeys(){
	let key1 = await window.crypto.subtle.generateKey({name: "AES-CBC",length: 256},true,["encrypt", "decrypt"]);
	let bytes1 = await window.crypto.subtle.exportKey('raw',key1);
	let passphrase = Buffer.from(bytes1).toString('hex')

	let pbkdf2salt = window.crypto.getRandomValues(new Uint8Array(8));
	var passphrasekey = await extractPassphraseKey(passphrase);

	let {key, ivbytes} = await extractKeyBytes(pbkdf2salt, passphrasekey, 'encrypt');
	return {ivbytes, key, passphrase, pbkdf2salt};
}

//encrypt raw bytes with generated passphrase key
async function encryptBytes(plaintextbytes,{ivbytes, key, passphrase, pbkdf2salt}){
	try {
		var cipherbytes= await window.crypto.subtle.encrypt({name: "AES-CBC", iv: ivbytes}, key, plaintextbytes).catch(function(err){});

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

//encrypt file
export async function encryptFile(objFile) {
	let plaintext = await readfile(objFile).catch(function(err){});
	let plaintextbytes = new Uint8Array(plaintext); //raw file
	let filenamebytes = new TextEncoder('utf-8').encode(objFile.name); //filename

	let keys = await generateKeys();
	let resultbytes = await encryptBytes(plaintextbytes,keys); //encrypt file
	let resultFilebytes = await encryptBytes(filenamebytes,keys); //encrypt filename
	let encryptedName = Buffer.from(resultFilebytes).toString('hex');

	var blob = new Blob([resultbytes], {type: objFile.type});
  return {blob,passphrase:keys.passphrase,encryptedName};
}

export async function encryptText(text){
	let plaintextbytes = new TextEncoder('utf-8').encode(text);

	let keys = await generateKeys();
	let resultbytes = await encryptBytes(plaintextbytes,keys);

	let encryptedText = Buffer.from(resultbytes).toString('hex');
	return {encryptedText,passphrase:keys.passphrase};
}


async function decryptBytes(bytes, passphrase){
	let {pbkdf2salt, cipherbytes} = extractCipherAndSalt(bytes);
	var passphrasekey = await extractPassphraseKey(passphrase);
	let {key, ivbytes} = await extractKeyBytes(pbkdf2salt, passphrasekey, 'decrypt');

	var plaintextbytes = await window.crypto.subtle.decrypt({name: "AES-CBC", iv: ivbytes}, key, cipherbytes).catch(function(err){});

	if (!plaintextbytes) return;
	return new Uint8Array(plaintextbytes);
}

//decrypt file
export async function decryptFile(objFile,passphrase) {
	var bytes = await readfile(objFile).catch(function(err){});
	bytes = new Uint8Array(bytes);

	let plaintextbytes = await decryptBytes(bytes, passphrase);
	var blob=new Blob([plaintextbytes], {type: objFile.type});
  return blob;
}

export async function decryptText(encryptedText, passphrase){
	let bytes = new hexStringToUint8Array(encryptedText);

	let plaintextbytes = await decryptBytes(bytes, passphrase);
	let text = new TextDecoder("utf-8").decode(plaintextbytes);
	return text;
}

function hexStringToUint8Array(hexString){
  if (hexString.length % 2 !== 0){
    throw new Error("Invalid hexString");
  }/*from  w w w.  j  av a 2s  . c  o  m*/
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

