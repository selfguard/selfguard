/**
 * It sends an email to the address provided.
 * @returns A boolean value of true if the email was sent.
 */
export async function sendEmail({
  address,
  from,
  fromName,
  replyTo,
  replyToName,
  subject,
  html,
}) {
  try {
    await this.fetch.sendEmailCall({
      address,
      from,
      fromName,
      replyTo,
      replyToName,
      subject,
      html,
    });
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
export async function sendSMS({ address, text }) {
  try {
    await this.fetch.sendSMSCall({ address, text });
    return true;
  } catch (err) {
    console.log({ err });
    throw new Error(err);
  }
}

/**
 * It updates the profile of the user.
 * @param address - The address of the user you want to update the profile for.
 * @param value - The value to be encrypted and stored in the database.
 * @returns A boolean value of true.
 */
export async function updateProfile(address, value) {
  try {
    let {encryption_key_id, ciphertext} = await this.encrypt(value);
    console.log({address});
    await this.fetch.updateProfile({address, ciphertext, encryption_key_id});
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
export async function getProfiles(params){
  let limit = params && params.limit ? params.limit : 50;
  let offset = params && params.offset ? params.offset : 0;
  let data = await this.fetch.getProfiles({ limit, offset });
  return data;
}

/**
 * It gets the profile of the user.
 * @param address - The address of the user you want to get the profile of.
 * @returns The data is being returned.
 */
export async function getProfile(address){
  let data = await this.fetch.getProfile(address);
  return data;
}