import { renderHook } from '@testing-library/react-hooks';
import { of as mockOf } from 'rxjs';
import { NotificationInput } from '../interfaces/Notification';
import { useNotifications } from './useNotifications';
import { getNotificationService } from '../services/getNotificationService';

jest.useFakeTimers();

const mockNotify = jest.fn();
const mockWarn = jest.fn();
const mockDeleteNotifications = jest.fn();
const mockDismissNotification = jest.fn();
const mockGetNextItem = jest.fn().mockReturnValue(mockOf(null));
const mockGetLastItems = jest.fn().mockReturnValue(mockOf(null));

const mockNotification1 = {
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

const mockNotification2 = {
  category: 'Transaction',
  chain: 'ethereum',
  content: 'content 2',
  dismissed: false,
  id: 'stored002',
  level: 'warning',
  timestamp: 1652569200001,
  title: 'StoredNotification 2',
};

jest.mock('../services/getNotificationService', () => ({
  getNotificationService: jest.fn(),
}));

describe('useNotifications()', () => {
  beforeEach(() => {
    (getNotificationService as jest.Mock).mockImplementation(() => ({
      notify: mockNotify,
      warn: mockWarn,
      deleteNotifications: mockDeleteNotifications,
      dismissNotification: mockDismissNotification,
      getNextItem: mockGetNextItem,
      getLastItems: mockGetLastItems,
    }));
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('should call `NotificationService.notify`', async () => {
    const mockNotificationInput1: NotificationInput = {
      chain: 'ethereum',
      category: 'Service',
      status: 'success',
      title: 'Notification 1',
      content: 'Notification content 1',
    };

    const mockNotificationInput2: NotificationInput = {
      chain: 'ethereum',
      category: 'Wallet',
      status: 'success',
      title: 'Notification 2',
      content: 'Notification content 2',
    };

    const { notify } = useNotifications();

    renderHook(() => notify(mockNotificationInput1));

    expect(mockNotify).toHaveBeenCalledTimes(1);
    expect(mockNotify).toHaveBeenCalledWith(mockNotificationInput1);

    renderHook(() => notify(mockNotificationInput2));

    expect(mockNotify).toHaveBeenCalledTimes(2);
    expect(mockNotify).toHaveBeenCalledWith(mockNotificationInput2);
  });

  it('should call `NotificationService.warn`', async () => {
    const mockWarnInput: NotificationInput = {
      chain: 'ethereum',
      category: 'Service',
      status: 'failure',
      title: 'Warn 1',
      content: 'Warn Content 1',
    };

    const { warn } = useNotifications();
    renderHook(() => warn(mockWarnInput));

    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockWarn).toHaveBeenCalledWith(mockWarnInput);
  });

  it('should call `NotificationService.deleteNotifications`', async () => {
    const { deleteNotifications } = useNotifications();
    renderHook(() => deleteNotifications());

    expect(mockDeleteNotifications).toHaveBeenCalledTimes(1);
  });

  it('should call `NotificationService.dismissNotification`', async () => {
    const { dismissNotification } = useNotifications();
    renderHook(() => dismissNotification('abc'));

    expect(mockDismissNotification).toHaveBeenCalledTimes(1);
    expect(mockDismissNotification).toHaveBeenCalledWith('abc');
  });

  it('should return the last notification emitted', async () => {
    mockGetNextItem.mockImplementation(() => mockOf(mockNotification1));
    const { getNextItem } = useNotifications();
    const { result } = renderHook(() => getNextItem());

    expect(result.current).toStrictEqual(mockNotification1);
  });

  it('should return the last stored notifications', async () => {
    const mockNotifications = [mockNotification1, mockNotification2];
    mockGetLastItems.mockImplementation(() => mockOf(mockNotifications));

    const { getLastItems } = useNotifications();
    const { result } = renderHook(() => getLastItems());
    expect(result.current).toStrictEqual(mockNotifications);
  });
});
