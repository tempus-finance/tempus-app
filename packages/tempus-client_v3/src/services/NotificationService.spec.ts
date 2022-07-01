import { act } from 'react-dom/test-utils';
import { NotificationInput } from '../interfaces/Notification';
import NotificationService, { NOTIFICATIONS_KEY } from './NotificationService';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v1: jest.fn().mockImplementation(() => 'abc000'),
}));

jest.useFakeTimers();

const mockStoredNotification1 = {
  category: 'Transaction',
  chain: 'fantom',
  content: 'content 1',
  dismissed: false,
  id: 'stored001',
  level: 'info',
  link: 'someLink',
  linkText: 'someLinkText',
  timestamp: 1652569200000,
  title: 'StoredNotification 1',
};

const mockStoredNotification2 = {
  category: 'Transaction',
  chain: 'ethereum',
  content: 'content 2',
  dismissed: false,
  id: 'stored002',
  level: 'warning',
  timestamp: 1652569200001,
  title: 'StoredNotification 2',
};

const mockStoredNotification3 = {
  category: 'Transaction',
  chain: 'ethereum',
  content: 'content 3',
  dismissed: false,
  id: 'stored003',
  level: 'warning',
  timestamp: 1652569200010,
  title: 'StoredNotification 3',
};

const mockStoredNotifications = [mockStoredNotification1, mockStoredNotification2, mockStoredNotification3];

const mockSet = jest.fn();
const mockGet = jest.fn();
const mockDelete = jest.fn();
const mockClear = jest.fn();

const mockStorageService = {
  set: mockSet,
  get: mockGet,
  delete: mockDelete,
  clear: mockClear,
};

const mockListener = jest.fn();

describe('NotificationService', () => {
  let notificationService: NotificationService;
  jest.spyOn(Date, 'now').mockReturnValue(new Date(1649031780000).getTime());

  afterAll(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('returns an instance of NotificationService', () => {
      notificationService = new NotificationService(mockStorageService);
      expect(notificationService).toBeDefined();
    });
  });

  describe('warn() and notify()', () => {
    beforeEach(() => {
      mockGet.mockReturnValue([]);
      notificationService = new NotificationService(mockStorageService);
    });

    it('stores a warning Transaction', () => {
      const input: NotificationInput = {
        chain: 'ethereum',
        category: 'Transaction',
        status: 'failure',
        title: 'Warning T',
        content: 'some content',
      };
      notificationService.warn(input);

      expect(mockSet).toHaveBeenCalledTimes(1);
      expect(mockSet).toHaveBeenCalledWith(NOTIFICATIONS_KEY, [
        {
          category: 'Transaction',
          status: 'failure',
          chain: 'ethereum',
          content: 'some content',
          dismissed: false,
          id: 'abc000',
          level: 'warning',
          link: undefined,
          linkText: undefined,
          timestamp: 1649031780000,
          title: 'Warning T',
        },
      ]);
    });

    it('stores a notification Transaction', () => {
      const input: NotificationInput = {
        chain: 'fantom',
        category: 'Transaction',
        status: 'success',
        title: 'Notify T',
        content: 'some other content',
        link: 'someLink',
        linkText: 'someLinkText',
      };
      notificationService.notify(input);

      expect(mockSet).toHaveBeenCalledTimes(1);
      expect(mockSet).toHaveBeenCalledWith(NOTIFICATIONS_KEY, [
        {
          category: 'Transaction',
          status: 'success',
          chain: 'fantom',
          content: 'some other content',
          dismissed: false,
          id: 'abc000',
          level: 'info',
          link: 'someLink',
          linkText: 'someLinkText',
          timestamp: 1649031780000,
          title: 'Notify T',
        },
      ]);
    });

    it('does not store a notification Wallet', () => {
      const input: NotificationInput = {
        chain: 'fantom',
        category: 'Wallet',
        status: 'success',
        title: 'Notify W',
        content: 'unimportant',
      };
      notificationService.notify(input);

      expect(mockSet).not.toHaveBeenCalled();
    });

    it('does not store a notification Service', () => {
      const input: NotificationInput = {
        chain: 'ethereum',
        category: 'Service',
        status: 'success',
        title: 'Notify S',
        content: 'some value',
      };
      notificationService.notify(input);

      expect(mockSet).not.toHaveBeenCalled();
    });
  });

  describe('getNextItem()', () => {
    beforeEach(() => {
      mockGet.mockReturnValue([]);
      notificationService = new NotificationService(mockStorageService);
    });

    it('emits notifications in the same order as they are created', () => {
      notificationService.getNextItem().subscribe(mockListener);

      const inputNotify: NotificationInput = {
        chain: 'fantom',
        category: 'Transaction',
        status: 'success',
        title: 'Notification 1',
        content: 'notification content',
        link: 'someLink',
        linkText: 'someLinkText',
      };

      notificationService.notify(inputNotify);

      const inputWarn: NotificationInput = {
        chain: 'fantom',
        category: 'Transaction',
        status: 'success',
        title: 'Notification 2',
        content: 'warning content',
        link: 'someLink',
        linkText: 'someLinkText',
      };

      notificationService.warn(inputWarn);

      expect(mockListener).toHaveBeenNthCalledWith(1, {
        category: 'Transaction',
        status: 'success',
        chain: 'fantom',
        content: 'notification content',
        dismissed: false,
        id: 'abc000',
        level: 'info',
        link: 'someLink',
        linkText: 'someLinkText',
        timestamp: 1649031780000,
        title: 'Notification 1',
      });

      expect(mockListener).toHaveBeenNthCalledWith(2, {
        category: 'Transaction',
        status: 'success',
        chain: 'fantom',
        content: 'warning content',
        dismissed: false,
        id: 'abc000',
        level: 'warning',
        link: 'someLink',
        linkText: 'someLinkText',
        timestamp: 1649031780000,
        title: 'Notification 2',
      });
    });
  });

  describe('getLastItems()', () => {
    beforeEach(() => {
      mockGet.mockReturnValue(mockStoredNotifications);
      notificationService = new NotificationService(mockStorageService);
    });

    afterAll(() => {
      mockGet.mockReturnValue([]);
    });

    it('emits last stored notifications', () => {
      expect(mockListener).not.toHaveBeenCalled();

      notificationService.getLastItems().subscribe(mockListener);

      expect(mockListener).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockDelete).toHaveBeenCalledTimes(1);

      expect(mockListener).toHaveBeenNthCalledWith(1, mockStoredNotification3);

      expect(mockListener).toHaveBeenNthCalledWith(2, mockStoredNotification2);

      expect(mockListener).toHaveBeenNthCalledWith(3, mockStoredNotification1);
    });
  });

  describe('deleteNotifications()', () => {
    beforeEach(() => {
      notificationService = new NotificationService(mockStorageService);
    });

    it('deletes all notifications', () => {
      notificationService.deleteNotifications();

      expect(mockDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('dismissNotification()', () => {
    beforeEach(() => {
      mockGet.mockReturnValue(mockStoredNotifications);
      notificationService = new NotificationService(mockStorageService);
    });

    it('dismisses a notification', () => {
      notificationService.dismissNotification('stored002');

      expect(mockSet).toHaveBeenCalledTimes(1);
      expect(mockSet).toBeCalledWith(NOTIFICATIONS_KEY, [
        mockStoredNotification1,
        {
          ...mockStoredNotification2,
          dismissed: true, // this changed
        },
        mockStoredNotification3,
      ]);
    });
  });
});
