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
