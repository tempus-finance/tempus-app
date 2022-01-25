import { JsonRpcProvider } from '@ethersproject/providers';
import { useEffect, useState } from 'react';
import { NETWORK_URLS } from '../constants';

const useENS = (address: string | null | undefined) => {
  const [ensName, setENSName] = useState<string | null | undefined>(null);
  const [ensAvatar, setENSAvatar] = useState<string | null | undefined>(null);

  useEffect(() => {
    const resolveENS = async () => {
      if (address) {
        const provider = new JsonRpcProvider(NETWORK_URLS[1]);
        const ensName = await provider.lookupAddress(address);
        const resolver = await provider.getResolver(ensName ?? '');
        const ensAvatar = await resolver?.getAvatar();
        setENSAvatar(ensAvatar?.url);
        setENSName(ensName);
      }
    };
    resolveENS();
  }, [address]);

  return { ensName, ensAvatar };
};

export default useENS;
