<div align="center">
  <img src="https://bafybeigfziugbx7542fy63mjyyeqtbbdpkbwj6mqu6gelkovgryvhbrglm.ipfs.w3s.link/selfguard.png">
  <h1 align="center"> SelfGuard</h1>
  <h3 align="center">Universal API For Encryption</h3>
  <p align='center'> SelfGuard allows you to easily encrypt and tokenize data  in a secure and compliant manner. </p>
  <p align='center'> <b>Get your API-Key</b> at <a href='https://selfguard.xyz'> https://selfguard.xyz </a>
</div>

## Description

SelfGuard takes out the hassle of implementing your own encryption scheme and storage of respective encryption keys. All API calls are logged and the event trail can be viewed by the API Key holder.  

## Installation

  `npm install selfguard-client`

## Usage

### Import SelfGuard-Client

```javascript

import SelfGuard from 'selfguard-client';

// or

let SelfGuard = require('selfguard-client');

```

### Instantiate

```javascript

let sg = new SelfGuard(API_KEY);

// or

let sg = new SelfGuard(API_KEY, PUBLIC_KEY, PRIVATE_KEY);

//This will leverage asymmetric encryption for all stored encryption keys.
//When encryption keys are sent to SelfGuard they are encrypted using the PUBLIC_KEY.
//When encryption keys are recieved from SelfGuard they are decrypted using the PRIVATE_KEY.

```
## Key Pair
Used for creating RSA or ECDSA (web3 compatible) public/private key pairs that can be used for asymmetric encryption.

### Generate Public Private Key Pair
```javascript

let key_pair = sg.generatePublicPrivateKeyPair('rsa','passwordToEncryptPrivateKey');
console.log(key_pair);
/*
{
  public_key: '-----BEGIN RSA PUBLIC KEY-----\n....',
  encrypted_private_key: '7d39f896d088e5890bb6cc4cf....',
  private_key: '-----BEGIN RSA PRIVATE KEY-----\n...'
}
*/

```

## Raw Encryption
Used for encrypting and storing any piece of data that can later be decrypted only by those who have permissions set by the API Key holder.

### Encrypt:

```javascript

let {encrypted_text, encryption_key_id} = await sg.encrypt( 'This is some super top secret text!')

console.log({encrypted_text,encryption_key_id})
// {encrypted_text: "5ac4asffda...... ", encryption_key_id:"e791a8a..."}

```

### Decrypt:

```javascript

let {encrypted_text, encryption_key_id} = await sg.decrypt(encrypted_text, encryption_key_id)

console.log(decryptedText)
// "This is some super top secret text!"

```
## Data Tokenization
Used as an encrypted storage to encrypt data without having to manage the encrypted data yourself.

### Tokenize:
```javascript

let token_id = await sg.tokenize( 'This is some super top secret text!')

console.log(token_id)
// tok_14A...

```

### Detokenize:

```javascript

let data = await sg.detokenize(token_id)

console.log(data)
// "This is some super top secret text!"

```

## Encrypted Key/Value Storage
Used as an encrypted database to store and key - > value data. Value data is fully encrypted and can only be decrypted only by those who have permissions set by the API Key holder.

### Put:
```javascript

let success = await sg.put('key','value');

```

### Get:

```javascript

let value = await sg.get('key');

console.log(value)
// "value"

```
## Encrypted Array Storage
Used as an encrypted database to store key -> multiple values. Value data is fully encrypted by an encryption key set up at the initiation of the array. Value data can only be decrypted by users who have been assigned access to the encryption key via asymmetric encryption.

### Create Array

```javascript

await sg.createArray('key');

```

### Add To Array
```javascript

await sg.addToArray('key','value');
await sg.addToArray('key','value2');

```

### Add User To Array
```javascript

await sg.addUserToArray('key','0xabc...');

```


### Get Array
```javascript

let data = await sg.getArray('key');
console.log(data)
// ['value','value2']

```

### Get Array Keys
```javascript

let keys = await sg.createArray('room1');
/*
[{
	key: 'key',
	length: 2,
	created_at: '2022-09-07T19:58:35.616997+00:00'
}]
*/

```


## Notifications
Used to send texts or emails to addresses who's email and phone number are stored using the encrypted key/value storage. Keys should be stored as
```javascript
"0x5F9f570eD75b3D8798D6b1309825d26f9B9038D1-email"
```
and
```javascript
"0x5F9f570eD75b3D8798D6b1309825d26f9B9038D1-phone"
```
when storing the email and phone number for 0x5F9f570eD75b3D8798D6b1309825d26f9B9038D1.

### Send SMS
```javascript

await sg.sendSMS({address:'0xadfb..',text:'Example Text'});

```

### Send Email
```javascript

await sg.sendEmail({address:'0xadfb..',from:'example@test.com',fromName:'test',replyTo:'reply@test.com', reployToName:'test',subject:"Test Subject", html:"This is the content of the email"});

```