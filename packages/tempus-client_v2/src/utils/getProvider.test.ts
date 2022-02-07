import { JsonRpcProvider } from '@ethersproject/providers';
import getProvider from './getProvider';

describe('getProvider', () => {
  const mockProvider = new JsonRpcProvider();
  const mockSigner = mockProvider.getSigner();

  test('pass in JsonRpcSigner should return JsonRpcSigner.provider', () => {
    expect(getProvider(mockSigner)).toBe(mockSigner.provider);
  });

  test('pass in JsonRpcProvider should return JsonRpcProvider itself', () => {
    expect(getProvider(mockProvider)).toBe(mockProvider);
  });
});
