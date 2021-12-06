import StorageService from './StorageService';

let storageService: StorageService;
const getStorageService = (): StorageService => {
  if (!storageService) {
    storageService = new StorageService();
  }

  return storageService;
};

export default getStorageService;
