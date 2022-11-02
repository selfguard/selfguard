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

export async function deleteNotificationGroup({collection_name}) {
  let data = await this.fetch.deleteNotificationGroup({collection_name});
  return data;
}

export async function updateNotificationGroup({old_collection_name, contract_address, collection_name}) {
  let data = await this.fetch.updateNotificationGroup({old_collection_name, contract_address, collection_name});
  return data;
}

export async function updateIntroductionMessage({notification_group_id, email_subject, email_body, sms_text}) {
  let data = await this.fetch.updateIntroductionMessage({notification_group_id, email_subject, email_body, sms_text});
  return data;
}