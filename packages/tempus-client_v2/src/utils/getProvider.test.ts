import { JsonRpcProvider } from '@ethersproject/providers';
import getProviderFromSignerOrProvider from './getProviderFromSignerOrProvider';

describe('getProvider', () => {
  const mockProvider = new JsonRpcProvider();
  const mockSigner = mockProvider.getSigner();

  test('pass in JsonRpcSigner should return JsonRpcSigner.provider', () => {
    expect(getProviderFromSignerOrProvider(mockSigner)).toBe(mockSigner.provider);
  });

  test('pass in JsonRpcProvider should return JsonRpcProvider itself', () => {
    expect(getProviderFromSignerOrProvider(mockProvider)).toBe(mockProvider);
  });
});
