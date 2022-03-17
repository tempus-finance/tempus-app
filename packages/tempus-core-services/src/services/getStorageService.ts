import { StorageService } from './StorageService';

let storageService: StorageService;
export const getStorageService = (): StorageService => {
  if (!storageService) {
    storageService = new StorageService();
  }

  return storageService;
};
