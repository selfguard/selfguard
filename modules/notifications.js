import {encryptValue} from '../helpers/encryption.js';
/**
 * It sends an email to the address provided.
 * @returns A boolean value of true if the email was sent.
 */
export async function sendEmail({ user_address, collection_name, subject, body}) {
  try {
    await this.fetch.sendEmailCall({user_address, collection_name, subject, body});
    return true;
  } catch (err) {
    console.log({ err });
    throw new Error(err);
  }
}

/**
 * It sends an SMS to the address provided.
 * @returns A boolean value of true if the SMS was sent.
 */
export async function sendSMS({ user_address, collection_name, text }) {
  try {
    await this.fetch.sendSMSCall({ user_address, collection_name, text });
    return true;
  } catch (err) {
    console.log({ err });
    throw new Error(err);
  }
}

/**
 * It sends an email to the address provided.
 * @returns A boolean value of true if the email was sent.
 */
 export async function sendBulkEmail({collection_name, subject, body}) {
  try {
    await this.fetch.sendBulkEmailCall({collection_name, subject, body});
    return true;
  } catch (err) {
    console.log({ err });
    throw new Error(err);
  }
}

/**
 * It sends an SMS to the address provided.
 * @returns A boolean value of true if the SMS was sent.
 */
export async function sendBulkSMS({collection_name, text }) {
  try {
    await this.fetch.sendBulkSMSCall({collection_name, text });
    return true;
  } catch (err) {
    console.log({ err });
    throw new Error(err);
  }
}


/**
 * It takes an address, a value, and a collection name, encrypts the value, and then updates the
 * profile with the encrypted value
 * @returns A boolean value.
 */
export async function updateProfile({user_address, value, collection_name}) {
  try {
    //check to make sure the group actually exists
    await this.fetch.getNotificationGroupByName(collection_name);

    let email_activated = value && value.email && value.email.length > 1 ? true : false;
    let phone_activated = value && value.phone && value.phone.length > 1 ? true : false;

    //encrypt the value
    let {encryption_key, ciphertext} = await encryptValue(value);
    //go ahead and encrypt the encryption key
    let encryption_instance = await this.encryptEncryptionKey(encryption_key);

    await this.fetch.updateProfile({collection_name, user_address, ciphertext, encryption_instance, email_activated, phone_activated});
  }
  catch(err){
    console.log({err})
    throw new Error(err);
  }
  return true;
}

/**
 * It fetches profiles from the server.
 * @param params 
 */
export async function getProfiles({limit, offset, collection_name}){
  let data = await this.fetch.getProfiles({limit, offset, collection_name});
  return data;
}

/**
 * It gets the profile of the user.
 * @param address - The address of the user you want to get the profile of.
 * @returns The data is being returned.
 */
export async function getProfile({user_address, collection_name}){
  let data = await this.fetch.getProfile({user_address, collection_name});
  return data;
}

export async function getNotificationGroupByName(collection_name){
  let data = await this.fetch.getNotificationGroupByName(collection_name);
  return data;
}

export async function getNotificationGroups(){
  let data = await this.fetch.getNotificationGroups();
  return data;
}

export async function createNotificationGroup({contract_address, collection_name}) {
  let data = await this.fetch.createNotificationGroup({contract_address, collection_name});
  return data;
}

export async function updateIntroductionMessage({notification_group_id, email_subject, email_body, sms_text}) {
  let data = await this.fetch.updateIntroductionMessage({notification_group_id, email_subject, email_body, sms_text});
  return data;
}