import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';

import userWalletReducer from './slices/user-wallet-slice';

export const store = configureStore({
  reducer: {
    userWallet: userWalletReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
