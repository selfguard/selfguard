
<div align='center'>
  <img src='https://bafybeigfziugbx7542fy63mjyyeqtbbdpkbwj6mqu6gelkovgryvhbrglm.ipfs.w3s.link/selfguard.png'>
  <h1 align='center'> SelfGuard</h1>
  <h3 align='center'>Universal API For Encryption</h3>
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

### Generate Public Private Key Pair
Allows you to create an RSA or ECSDA key pair.
```javascript

let key_pair = sg.createKeyPair('rsa' || 'ecdsa');
console.log(key_pair);
/*
{
  public_key: '-----BEGIN RSA PUBLIC KEY-----\n....',
  private_key: '-----BEGIN RSA PRIVATE KEY-----\n...'
}
*/

```

### Upload Key Pair
Allows you to save this key pair with SelfGuard, encrypted with a password
```javascript

await sg.uploadKeyPair(key_pair,'password');

```

### Get Key Pairs
Allows you to retrieve all encrypted key pairs stored with this account

```javascript

let key_pairs = await sg.getKeyPairs();

//decrypt the last uploaded key pair
let  decrypted_key_pair = sg.decryptWithPassword(key_pairs[key_pairs.length -1].encrypted_private_key,'password');

```

## Encryption

### Encrypt:
Allows you to encrypt any piece of data and receive the respective encryption key id (the encryption key is stored with SelfGuard) and the encrypted text. 
```javascript

let {encrypted_text, encryption_key_id} = await sg.encrypt( 'This is some super top secret text!')

console.log({encrypted_text,encryption_key_id})
// {encrypted_text: '5ac4asffda...... ', encryption_key_id:'e791a8a...'}

```

### Decrypt:
Allows you to decrypt previously encrypted data by providing the encrypted text and the encryption key id respective to the encrypted data. 
```javascript

let decryptedText = await sg.decrypt(encrypted_text, encryption_key_id)

console.log(decryptedText)
// 'This is some super top secret text!'

```

### Encrypt With Password
Allows you to encrypt any piece of data with a password.
```javascript

let ciphertext = sg.encryptWithPassword( 'This is some super top secret text!','password')

```

### Decrypt With Password:
Allows you to decrypt encrypted data with the respective password.
```javascript

let decryptedText = sg.decryptWithPassword(ciphertext, 'password')

console.log(decryptedText)
// 'This is some super top secret text!'

```


### File Storage

### Encrypt File
Allows you to shard and encrypt any file and automatically upload it to IPFS
```javascript

  const file = new File(["foobartexthello"], "foo.txt", {type: "text/plain"});
  let fileId = await sg.encryptFile(file, 3);

```

### Decrypt File
Allows you to retrieve the file shards for the associated file id and decrypt them 
```javascript

let file2 = await sg.decryptFile(fileId);

```

### Get Files
Allows you to retrieve all files stored with SelfGuard + IPFS
```javascript

let files = await sg.getFiles();

```

## Data Tokenization

### Tokenize:
Allows you to encrypt data and store the encrypted data with SelfGuard itself. 
```javascript

let token_id = await sg.tokenize( 'This is some super top secret text!')
console.log(token_id)
// tok_14A...

```

### Detokenize:
Allows you to retrieve the previously tokenized data by providing the respective token id.
```javascript

let data = await sg.detokenize(token_id)
console.log(data)
// 'This is some super top secret text!'

```

## Encrypted Key/Value Storage

### Put:
Allows you to store any key value data where the value is encrypted. 
```javascript

let success = await sg.put('key','value');

```

### Get:
Allows you to retrieve key value data where the value is decrypted upon retrieval
```javascript

let value = await sg.get('key');

console.log(value)
// 'value'

```

### Get  Keys
Allows you to get all the keys (amongst all the key-value objects) stored with this account
```javascript

await sg.getKeys();

```


## Encrypted Array Storage
Used as an encrypted database to store key -> multiple values. Value data is fully encrypted by an encryption key set up at the initiation of the array. Value data can only be decrypted by users who have been assigned access to the encryption key via asymmetric encryption.

### Create Array

```javascript

await sg.createArray('name');

```

### Add To Array
```javascript

await sg.addToArray('name','value');
await sg.addToArray('name','value2');

```

### Add User To Array
```javascript

await sg.addUserToArray('name','0xabc...');

```


### Get Array
```javascript

let data = await sg.getArray('name');
console.log(data)
// ['value','value2']

```

### Get Array Names
```javascript

let keys = await sg.getArrayNames();
console.log(keys);
/*
[{
	name: 'name',
	length: 2,
	created_at: '2022-09-07T19:58:35.616997+00:00'
}]
*/

```


## Notifications
Used to send texts or emails to addresses who's email and phone number are stored using the encrypted key/value storage. Keys should be stored as
```javascript
'0x5F9f570eD75b3D8798D6b1309825d26f9B9038D1-profile'
```
when storing the email and phone number for 0x5F9f570eD75b3D8798D6b1309825d26f9B9038D1.

### Send SMS
```javascript

await sg.sendSMS({address:'0xadfb..',text:'Example Text'});

```

### Send Email
```javascript

await sg.sendEmail({address:'0xadfb..',from:'example@test.com',fromName:'test',replyTo:'reply@test.com', reployToName:'test',subject:'Test Subject', html:'This is the content of the email'});

```