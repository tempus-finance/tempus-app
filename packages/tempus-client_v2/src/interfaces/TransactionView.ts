export type BasicTransactionView = 'Deposit' | 'Withdraw';

export type AdvancedTransactionView = 'Mint' | 'Swap' | 'Provide Liquidity' | 'Remove Liquidity' | 'Early Redeem';

export type TransactionView = BasicTransactionView | AdvancedTransactionView;
