import { JsonRpcSigner } from '@ethersproject/providers';
import { ContractTransaction } from 'ethers';
import { DEADLINE_PRECISION, INFINITE_DEADLINE } from '../constants';
import { TempusAMMV1Contract } from '../contracts/TempusAMMV1Contract';
import { TempusControllerV1Contract } from '../contracts/TempusControllerV1Contract';
import { Decimal } from '../datastructures';
import { Chain, Ticker } from '../interfaces';
import { getDepositAmountFromTx } from '../utils';
import { BaseService, ConfigGetter } from './BaseService';

export class DepositService extends BaseService {
  #chain: Chain;

  constructor(chain: Chain, getConfig: ConfigGetter) {
    super(getConfig);

    this.#chain = chain;
  }

  get chain(): Chain {
    return this.#chain;
  }

  async fixedDeposit(
    poolAddress: string,
    tokenAmount: Decimal,
    tokenTicker: Ticker,
    tokenAddress: string,
    slippage: Decimal,
    signer: JsonRpcSigner,
  ): Promise<{
    contractTransaction: ContractTransaction;
    depositedAmount: Decimal;
  }> {
    const tempusControllerContractAddress = this.getTempusControllerAddressForPool(poolAddress);
    const tokenPrecision = this.getTokenPrecision(tokenAddress);
    const poolConfig = this.getPoolConfig(poolAddress);

    const tempusControllerContract = new TempusControllerV1Contract(
      this.#chain,
      tempusControllerContractAddress,
      signer,
    );
    const tempusAMM = new TempusAMMV1Contract(this.#chain, poolConfig.ammAddress);

    let minTYSRate: Decimal;
    try {
      const tysRate = await tempusAMM.getExpectedReturnGivenIn(
        new Decimal(1),
        true,
        poolConfig.tokenPrecision.principals,
        poolConfig.tokenPrecision.yields,
      );
      minTYSRate = tysRate.sub(tysRate.mul(slippage));
    } catch (error) {
      console.error('DepositService - fixedDeposit() - Failed to get yields token exchange rate!', error);
      return Promise.reject(error);
    }

    const isBackingToken = tokenAddress === poolConfig.backingTokenAddress;

    const deadline = new Decimal(INFINITE_DEADLINE, DEADLINE_PRECISION);

    let contractTransaction: ContractTransaction;
    try {
      contractTransaction = await tempusControllerContract.depositAndFix(
        poolConfig.ammAddress,
        tokenAmount,
        tokenTicker,
        tokenPrecision,
        poolConfig.tokenPrecision.yields,
        isBackingToken,
        minTYSRate,
        deadline,
      );
    } catch (error) {
      console.error('DepositService - fixedDeposit() - Failed to execute deposit!');
      return Promise.reject(error);
    }

    let walletAddress;
    try {
      walletAddress = await signer.getAddress();
    } catch (error) {
      console.error('DepositService - fixedDeposit() - Failed to get wallet address from signer!');
      return Promise.reject(error);
    }

    let depositedAmount: Decimal;
    try {
      depositedAmount = await getDepositAmountFromTx(contractTransaction, tokenAddress, tokenPrecision, walletAddress);
    } catch (error) {
      console.error('DepositService - fixedDeposit() - Failed to get deposit amount from deposit transaction receipt!');
      return Promise.reject(error);
    }

    return {
      depositedAmount,
      contractTransaction,
    };
  }
}
