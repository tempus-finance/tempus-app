export type ProtocolName = 'aave' | 'compound' | 'lido';

export type Protocol = {
  name: ProtocolName;
  address: string;
};
