import LitJsSdk from "@lit-protocol/sdk-browser";

export async function initLit(){
    const client = new LitJsSdk.LitNodeClient();
    await client.connect();
    window.litNodeClient = client;
}

export function getCondition(address,chain) {
    return [
        {
            contractAddress: '',
            standardContractType: '',
            chain,
            method: '',
            parameters: [
            ':userAddress',
            ],
            returnValueTest: {
            comparator: '=',
            value: address
            }
        }
    ]
}

export async function getAuthSig(chain) {
    const authSig = await LitJsSdk.checkAndSignAuthMessage({chain});
    return authSig;
}

export async function getEncryptionParams(chain){
    if(!window.litNodeClient) await initLit();
    let address = window.ethereum.selectedAddress;
    let authSig = await getAuthSig(chain);
    let accessControlConditions = getCondition(address,chain);
    return {authSig, accessControlConditions};
}

export async function saveLitEncryptionKey(symmetricKey, chain) {
    if(!chain) chain = 'ropsten';
    let {authSig, accessControlConditions} = await getEncryptionParams(chain);
    symmetricKey = LitJsSdk.uint8arrayFromString(symmetricKey, "base16");
    let encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
        accessControlConditions,
        symmetricKey,
        authSig,
        chain,
    });
    encryptedSymmetricKey = LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16");
    return encryptedSymmetricKey
}

export async function getLitEncryptionKey(encryptedSymmetricKey, chain){
    try {
        if(!chain) chain = 'ropsten';
        let {authSig, accessControlConditions} = await getEncryptionParams(chain);
        let symmetricKey = await window.litNodeClient.getEncryptionKey({
            accessControlConditions,
            toDecrypt: encryptedSymmetricKey,
            chain,
            authSig
        });
        symmetricKey = LitJsSdk.uint8arrayToString(symmetricKey, "base16");
        return symmetricKey;
    }
    catch(err){
        console.log({err});
        return encryptedSymmetricKey;
    }
}