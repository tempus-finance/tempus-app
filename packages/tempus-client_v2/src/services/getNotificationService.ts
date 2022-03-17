import { getStorageService } from 'tempus-core-services';
import NotificationService from './NotificationService';

let notificationService: NotificationService;

const getNotificationService = (): NotificationService => {
  if (!notificationService) {
    notificationService = new NotificationService(getStorageService());
  }

  return notificationService;
};

export default getNotificationService;
