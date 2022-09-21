/**
 * This function retrieves all events from the database and returns them as an array of events
 * @returns An array of events.
 */
export async function retrieveEvents() {
  try {
    let data = await this.fetch.retrieveEvents();
    return data;
  } catch (err) {
    console.log({ err });
    throw new Error(err);
  }
}
