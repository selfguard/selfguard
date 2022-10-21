/**
 * It sends an email to the address provided.
 * @returns A boolean value of true if the email was sent.
 */
export async function sendEmail({ address, collection_name, from, fromName, replyTo, replyToName, subject, html}) {
  try {
    await this.fetch.sendEmailCall({address, collection_name, from, fromName, replyTo, replyToName, subject, html});
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
export async function sendSMS({ address, collection_name, text }) {
  try {
    await this.fetch.sendSMSCall({ address, collection_name, text });
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
export async function updateProfile({address, value, collection_name}) {
  try {
    let email_activated = value && value.email && value.email.length > 1;
    let phone_activated = value && value.phone && value.phone.length > 1;
    await this.fetch.getNotificationGroupByName({collection_name});
    let {encryption_key_id, ciphertext} = await this.encrypt(value);
    await this.fetch.updateProfile({collection_name, address, ciphertext, encryption_key_id, email_activated, phone_activated});
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
export async function getProfile({address, collection_name}){
  let data = await this.fetch.getProfile({address, collection_name});
  return data;
}

export async function getNotificationGroupByName({collection_name}){
  let data = await this.fetch.getNotificationGroupByName({collection_name});
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