import NotificationService from './NotificationService';

let notificationService: NotificationService;

const getNotificationService = (): NotificationService => {
  if (!notificationService) {
    notificationService = new NotificationService();
  }

  return notificationService;
};

export default getNotificationService;
