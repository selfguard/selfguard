
<p align="center">
  <img src="https://bafybeigfziugbx7542fy63mjyyeqtbbdpkbwj6mqu6gelkovgryvhbrglm.ipfs.w3s.link/selfguard.png">
  <h1 align="center"> SelfGuard</h1>
  <h3 align="center">Universal API For Encryption</h3>
  <p align='center'> SelfGuard allows you to easily encrypt and tokenize data  in a secure and compliant manner. </p>
  <p align='center'> <b>Get your API-Key</b> at <a href='https://selfguard.xyz'> https://selfguard.xyz </a>
</p>

## Description

SelfGuard takes out the hassle of implementing your own encryption scheme and storage of respective encryption keys.

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