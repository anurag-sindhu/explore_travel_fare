const webNotificationsService = require('../../../services/communication/webNotifications/index');
this.sendWebNotification = async ({ title, message, sound }) => {
  return webNotificationsService.sendWebNotification({ title, message, sound });
};
