export async function getNotificationGroupByName(notification_group){
  let data = await this.fetch.getNotificationGroupByName(notification_group);
  return data;
}

export async function getNotificationGroups(){
  let data = await this.fetch.getNotificationGroups();
  return data;
}

export async function createNotificationGroup({contract_address, notification_group}) {
  let data = await this.fetch.createNotificationGroup({contract_address, notification_group});
  return data;
}

export async function deleteNotificationGroup({notification_group}) {
  let data = await this.fetch.deleteNotificationGroup({notification_group});
  return data;
}

export async function updateNotificationGroup({old_notification_group, contract_address, notification_group}) {
  let data = await this.fetch.updateNotificationGroup({old_notification_group, contract_address, notification_group});
  return data;
}

export async function updateIntroductionMessage({notification_group_id, email_subject, email_body, sms_text}) {
  let data = await this.fetch.updateIntroductionMessage({notification_group_id, email_subject, email_body, sms_text});
  return data;
}

export async function activateIntroductionMessage({notification_group,activate}) {
  let data = await this.fetch.activateIntroductionMessage({notification_group,activate});
  return data;
}

export async function getNotificationCount() {
  let data = await this.fetch.getNotificationCount();
  return data;
}