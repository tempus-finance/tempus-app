import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

export interface InitialState {
  address: string;
}

const initialState: InitialState = {
  address: '',
};

export const userWalletSlice = createSlice({
  name: 'user-wallet',
  initialState,
  reducers: {
    setUserWalletAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
  },
});

export const { setUserWalletAddress } = userWalletSlice.actions;

export const selectUserWalletAddress = (state: RootState): string => state.userWallet.address;

export default userWalletSlice.reducer;
