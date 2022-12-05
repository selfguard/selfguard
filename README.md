<div align='center'>
  <img src='https://bafybeigfziugbx7542fy63mjyyeqtbbdpkbwj6mqu6gelkovgryvhbrglm.ipfs.w3s.link/selfguard.png'>
  <h1 align='center'> SelfGuard</h1>
  <h3 align='center'>Universal API For Encryption</h3>
  <p align='center'> SelfGuard provides encryption APIs and tooling to allow web2/3 developers to build enhanced and secure UI/UX. These include Encrypted Notifications, File Storage, Custodianship, and Payments. </p>
  <p align='center'> Contact arjun@selfguard.xyz with any questions. </p>
  <p align='center'> <b>Get your API-Key</b> at <a href='https://selfguard.xyz'> https://selfguard.xyz </a>
  <p align='center'><a href='https://docs.selfguard.xyz'> View the Full Docs </a></p>
</div>

## Installation

  `npm install selfguard-client`

## Usage

### Import SelfGuard-Client

```javascript

import SelfGuard from 'selfguard-client';

```


# Instantiation
There are three main ways to instantiate SelfGuard.

### Without Asymmetric Encryption

This instantiates SelfGuard such that data with SelfGuard can be decrypted with this API-KEY.

```javascript

let sg = new SelfGuard(API_KEY);

```

### With Asymmetric Encryption (Key Pair)
This instantiates SelfGuard such that data encrypted with SelfGuard can only be decrypted by the user with the respective public/private key pair.

```javascript

let sg = new SelfGuard(API_KEY, key_pair_type, public_key, private_key);

```

### With Asymmetric Encryption (Metamask)
This instantiates SelfGuard such that data encrypted with SelfGuard can only be decrypted by the end user's metamask's account.
```javascript

let sg = new SelfGuard(API_KEY, 'metamask');

```

## Key Pair

### Generate Public Private Key Pair
Allows you to create an RSA or ECSDA key pair.
```javascript

let key_pair = sg.createKeyPair('rsa' || 'ecdsa');

```

### Upload Key Pair
Allows you to save this key pair with SelfGuard, encrypted with a password
```javascript

await sg.uploadKeyPair(key_pair,'password');

```

### Get Key Pairs
Allows you to retrieve all encrypted key pairs stored with this account

```javascript

await sg.getKeyPairs();

```

## Encryption

### Encrypt:
Allows you to encrypt any piece of data and receive the respective encryption key id (the encryption key is stored with SelfGuard) and the encrypted text.
```javascript

await sg.encrypt( 'This is some super top secret text!')

```

### Decrypt:
Allows you to decrypt previously encrypted data by providing the encrypted text and the encryption key id respective to the encrypted data.
```javascript

await sg.decrypt(encrypted_text, encryption_key_id)

```

### Encrypt With Password
Allows you to encrypt any piece of data with a password.
```javascript

sg.encryptWithPassword( 'This is some super top secret text!','password')

```

### Decrypt With Password:
Allows you to decrypt encrypted data with the respective password.
```javascript

sg.decryptWithPassword(ciphertext, 'password')

```
## File Storage
Used for storing encrypted files onto decentralized storage protocols like IPFS.

### Upload/Encrypt File
```javascript

await sg.encryptFile(file,(err,progress) => {
	console.log(progress);
});

```

### Decrypt File
```javascript

await sg.decryptFile(id,(err,progress) => {
	console.log(progress);
});

```

### Get List of Files
```javascript

await sg.getFiles();

```


## Data Tokenization

### Tokenize:
Allows you to encrypt data and store the encrypted data with SelfGuard itself.
```javascript

await sg.tokenize( 'This is some super top secret text!');

```

### Detokenize:
Allows you to retrieve the previously tokenized data by providing the respective token id.
```javascript

let data = await sg.detokenize(token_id)

```

## Encrypted Key/Value Storage

### Put:
Allows you to store any key value data where the value is encrypted.
```javascript

await sg.put('key','value');

```

### Get:
Allows you to retrieve key value data where the value is decrypted upon retrieval
```javascript

await sg.get('key');

```

### Get  Keys
Allows you to get all the keys (amongst all the key-value objects) stored with this account
```javascript

await sg.getKeys();

```


## Notifications
Used to send texts or emails to addresses who's email and phone number are stored using the encrypted key/value storage.

### React Component For Notifications

Add Package
```
npm install selfguard-react-components
```

Implement Component
```javascript
import { NotificationsButton } from  'selfguard-react-components';
return (
	<NotificationsButton
    api_key={api_key} 
    notification_group={notification_group} 
    user_address={user_address}
    background={background}
    size={size}
    color={color}
    onDisabled={onDisabled}
    onEnabled={onEnabled}
/>
)
```
### Update Profile
```javascript

await sg.updateProfile({user_address, value, notification_group});

```

### Send SMS
```javascript

await sg.sendSMS({user_address,notification_group,text});

```

### Send Email
```javascript

await sg.sendEmail({user_address,notification_group, subject, body});

```