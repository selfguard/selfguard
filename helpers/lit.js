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

export async function getEncryptionParams(chain, sig){
    if(!window.litNodeClient) await initLit();
    //if we have passed in an auth sig, just use that, otherwise call metamask
    let authSig = sig ? sig : await getAuthSig(chain);
    let accessControlConditions = getCondition(authSig.address,chain);
    return {authSig, accessControlConditions};
}

export async function saveLitEncryptionKey(symmetricKey, chain, sig) {
    if(!chain) chain = 'ethereum';
    let {authSig, accessControlConditions} = await getEncryptionParams(chain, sig);
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

export async function getLitEncryptionKey(encryptedSymmetricKey, chain, sig){
    try {
        if(!chain) chain = 'ethereum';
        let {authSig, accessControlConditions} = await getEncryptionParams(chain, sig);
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