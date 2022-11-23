/**
 * It sends an email to the address provided.
 * @returns A boolean value of true if the email was sent.
 */
export async function sendEmail({ user_address, notification_group, subject, body}) {
  try {
    await this.fetch.sendEmailCall({user_address, notification_group, subject, body});
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
export async function sendSMS({ user_address, notification_group, text }) {
  try {
    await this.fetch.sendSMSCall({ user_address, notification_group, text });
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
 export async function sendBulkEmail({notification_group, subject, body}) {
  try {
    await this.fetch.sendBulkEmailCall({notification_group, subject, body});
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
export async function sendBulkSMS({notification_group, text }) {
  try {
    await this.fetch.sendBulkSMSCall({notification_group, text });
    return true;
  } catch (err) {
    console.log({ err });
    throw new Error(err);
  }
}