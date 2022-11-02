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