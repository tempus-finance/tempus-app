import { ethers } from 'ethers';

export type PendingTransaction = ethers.ContractTransaction & {
  id?: string;
  timestamp?: number;
  title?: string;
  content?: string;
  link?: string;
  linkText?: string;
};
