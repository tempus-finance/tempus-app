import NotificationService from './NotificationService';
import getStorageService from './getStorageService';

let notificationService: NotificationService;

const getNotificationService = (): NotificationService => {
  if (!notificationService) {
    notificationService = new NotificationService(getStorageService());
  }

  return notificationService;
};

export default getNotificationService;
