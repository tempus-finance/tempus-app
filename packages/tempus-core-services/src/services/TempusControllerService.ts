import { BigNumber, Contract, ContractInterface, ContractTransaction } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { TypedEvent } from '../abi/commons';
import TempusControllerABI, { TempusController } from '../abi/TempusController';
import {
  completeExitAndRedeemGasIncrease,
  depositAndFixGasIncrease,
  depositAndProvideLiquidityGasIncrease,
  depositBackingGasIncrease,
  depositYieldBearingGasIncrease,
  INFINITE_DEADLINE,
} from '../constants';
import { Chain, ChainConfig } from '../interfaces';
import { decreasePrecision } from '../utils';
import { TempusAMMService } from './TempusAMMService';

type TempusControllerServiceParameters = {
  Contract: typeof Contract;
  address: string;
  abi: typeof TempusControllerABI;
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
  tempusAMMService: TempusAMMService;
  chain: Chain;
  getChainConfig: (chain: Chain) => ChainConfig;
};

// I need to define event types like this, because TypeChain plugin for Hardhat does not generate them.
// TODO - Use event types from auto generated contract typings file when TypeChain plugin for Hardhat adds them.
// See: https://github.com/ethereum-ts/TypeChain/issues/454
export type DepositedEvent = TypedEvent<
  [string, string, string, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
    pool: string;
    depositor: string;
    recipient: string;
    yieldTokenAmount: BigNumber;
    backingTokenValue: BigNumber;
    shareAmounts: BigNumber;
    interestRate: BigNumber;
    fee: BigNumber;
  }
>;
export type RedeemedEvent = TypedEvent<
  [string, string, string, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, boolean] & {
    pool: string;
    redeemer: string;
    recipient: string;
    principalShareAmount: BigNumber;
    yieldShareAmount: BigNumber;
    yieldTokenAmount: BigNumber;
    backingTokenValue: BigNumber;
    interestRate: BigNumber;
    fee: BigNumber;
    isEarlyRedeem: boolean;
  }
>;

export class TempusControllerService {
  private chain: Chain | null = null;

  private contract: TempusController | null = null;

  private getChainConfig: ((chain: Chain) => ChainConfig) | null = null;

  private tempusAMMService: TempusAMMService | null = null;

  init({
    address,
    abi,
    signerOrProvider,
    chain,
    getChainConfig,
    tempusAMMService,
  }: TempusControllerServiceParameters): void {
    try {
      this.contract = new Contract(address, abi as unknown as ContractInterface, signerOrProvider) as TempusController;
    } catch (error) {
      console.error('TempusControllerService - init', error);
    }
    this.getChainConfig = getChainConfig;
    this.chain = chain;
    this.tempusAMMService = tempusAMMService;
  }

  public async getDepositedEvents(filters: {
    forPool?: string;
    forUser?: string;
    fromBlock?: number;
    toBlock?: number;
  }): Promise<DepositedEvent[]> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - getDepositedEvents() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      return await this.contract.queryFilter(
        this.contract.filters.Deposited(filters.forPool, filters.forUser),
        filters.fromBlock,
        filters.toBlock,
      );
    } catch (error) {
      console.error('TempusControllerService getDepositedEvents() - Failed to get deposited events!', error);
      return Promise.reject(error);
    }
  }

  public async getRedeemedEvents(filters: {
    forPool?: string;
    forUser?: string;
    fromBlock?: number;
    toBlock?: number;
  }): Promise<RedeemedEvent[]> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - getRedeemedEvents() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      const fetchEventsForRedeemer = undefined;
      return await this.contract.queryFilter(
        this.contract.filters.Redeemed(filters.forPool, fetchEventsForRedeemer, filters.forUser),
        filters.fromBlock,
        filters.toBlock,
      );
    } catch (error) {
      console.error('TempusControllerService getRedeemEvents() - Failed to get redeemed events!', error);
      return Promise.reject(error);
    }
  }

  public async depositAndFix(
    tempusAMM: string,
    tokenAmount: BigNumber,
    isBackingToken: boolean,
    minTYSRate: BigNumber,
    isEthDeposit?: boolean,
  ): Promise<ContractTransaction> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - depositAndFix() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      if (isEthDeposit) {
        const estimate = await this.contract.estimateGas.depositAndFix(
          tempusAMM,
          tokenAmount,
          isBackingToken,
          minTYSRate,
          INFINITE_DEADLINE,
          {
            value: tokenAmount,
          },
        );
        return await this.contract.depositAndFix(
          tempusAMM,
          tokenAmount,
          isBackingToken,
          minTYSRate,
          INFINITE_DEADLINE,
          {
            value: tokenAmount,
            gasLimit: Math.ceil(estimate.toNumber() * depositAndFixGasIncrease),
          },
        );
      }
      const estimate = await this.contract.estimateGas.depositAndFix(
        tempusAMM,
        tokenAmount,
        isBackingToken,
        minTYSRate,
        INFINITE_DEADLINE,
      );
      return await this.contract.depositAndFix(tempusAMM, tokenAmount, isBackingToken, minTYSRate, INFINITE_DEADLINE, {
        gasLimit: Math.ceil(estimate.toNumber() * depositAndFixGasIncrease),
      });
    } catch (error) {
      console.error('TempusControllerService depositAndFix() - Failed to deposit backing tokens!', error);
      return Promise.reject(error);
    }
  }

  public async depositAndProvideLiquidity(
    tempusAMM: string,
    tokenAmount: BigNumber,
    isBackingToken: boolean,
    isEthDeposit?: boolean,
  ): Promise<ContractTransaction> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - depositAndProvideLiquidity() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      if (isEthDeposit) {
        const estimate = await this.contract.estimateGas.depositAndProvideLiquidity(
          tempusAMM,
          tokenAmount,
          isBackingToken,
          {
            value: tokenAmount,
          },
        );
        return await this.contract.depositAndProvideLiquidity(tempusAMM, tokenAmount, isBackingToken, {
          value: tokenAmount,
          gasLimit: Math.ceil(estimate.toNumber() * depositAndProvideLiquidityGasIncrease),
        });
      }
      const estimate = await this.contract.estimateGas.depositAndProvideLiquidity(
        tempusAMM,
        tokenAmount,
        isBackingToken,
      );
      return await this.contract.depositAndProvideLiquidity(tempusAMM, tokenAmount, isBackingToken, {
        gasLimit: Math.ceil(estimate.toNumber() * depositAndProvideLiquidityGasIncrease),
      });
    } catch (error) {
      console.error(
        'TempusControllerService depositAndProvideLiquidity() - Failed to do deposit and provide liquidity!',
        error,
      );
      return Promise.reject(error);
    }
  }

  public async exitTempusAmmAndRedeem(
    tempusAMM: string,
    lpTokensAmount: BigNumber,
    principalsAmount: BigNumber,
    yieldsAmount: BigNumber,
    minPrincipalsStaked: BigNumber,
    minYieldsStaked: BigNumber,
    yieldsRate: BigNumber,
    maxSlippage: BigNumber,
    isBackingToken: boolean,
    principalsPrecision: number,
    lpTokenPrecision: number,
  ): Promise<ContractTransaction> {
    if (!this.contract || !this.tempusAMMService || !this.chain || !this.getChainConfig) {
      console.error(
        'TempusControllerService - exitTempusAmmAndRedeem() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    const tempusPoolConfig = this.getChainConfig(this.chain).tempusPools.find(
      config => config.ammAddress === tempusAMM,
    );
    if (!tempusPoolConfig) {
      console.error('TempusControllerService - exitTempusAmmAndRedeem() - Failed to get tempus pool config!');
      return Promise.reject();
    }

    let lpTokensAmountParsed = lpTokensAmount;
    if (lpTokenPrecision > principalsPrecision) {
      lpTokensAmountParsed = decreasePrecision(lpTokensAmount, lpTokenPrecision - principalsPrecision);
    }

    const maxLeftoverShares = TempusAMMService.getMaxLeftoverShares(
      principalsAmount,
      yieldsAmount,
      lpTokensAmountParsed,
    );

    try {
      const estimate = await this.contract.estimateGas.exitAmmGivenLpAndRedeem(
        tempusAMM,
        lpTokensAmount,
        principalsAmount,
        yieldsAmount,
        minPrincipalsStaked,
        minYieldsStaked,
        maxLeftoverShares,
        yieldsRate,
        maxSlippage,
        isBackingToken,
        INFINITE_DEADLINE,
      );
      return await this.contract.exitAmmGivenLpAndRedeem(
        tempusAMM,
        lpTokensAmount,
        principalsAmount,
        yieldsAmount,
        minPrincipalsStaked,
        minYieldsStaked,
        maxLeftoverShares,
        yieldsRate,
        maxSlippage,
        isBackingToken,
        INFINITE_DEADLINE,
        {
          gasLimit: Math.ceil(estimate.toNumber() * completeExitAndRedeemGasIncrease),
        },
      );
    } catch (error) {
      console.error('TempusControllerService exitTempusAmmAndRedeem() - Failed to redeem tokens!', error);
      return Promise.reject(error);
    }
  }

  async depositYieldBearing(tempusPool: string, amount: BigNumber, recipient: string): Promise<ContractTransaction> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - depositYieldBearing() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      const estimate = await this.contract.estimateGas.depositYieldBearing(tempusPool, amount, recipient);
      return await this.contract.depositYieldBearing(tempusPool, amount, recipient, {
        gasLimit: Math.ceil(estimate.toNumber() * depositYieldBearingGasIncrease),
      });
    } catch (error) {
      console.error('TempusControllerService - depositYieldBearing() - Failed to deposit yield bearing token!', error);
      return Promise.reject(error);
    }
  }

  async depositBacking(
    tempusPool: string,
    amount: BigNumber,
    recipient: string,
    isEthDeposit?: boolean,
  ): Promise<ContractTransaction> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - depositBacking() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    try {
      if (isEthDeposit) {
        const estimate = await this.contract.estimateGas.depositBacking(tempusPool, amount, recipient, {
          value: amount,
        });
        return await this.contract.depositBacking(tempusPool, amount, recipient, {
          value: amount,
          gasLimit: Math.ceil(estimate.toNumber() * depositBackingGasIncrease),
        });
      }
      const estimate = await this.contract.estimateGas.depositBacking(tempusPool, amount, recipient);
      return await this.contract.depositBacking(tempusPool, amount, recipient, {
        gasLimit: Math.ceil(estimate.toNumber() * depositBackingGasIncrease),
      });
    } catch (error) {
      console.error('TempusControllerService - depositBacking() - Failed to deposit backing token!', error);
      return Promise.reject(error);
    }
  }

  async redeemToBacking(
    tempusPool: string,
    userWalletAddress: string,
    amountOfShares: BigNumber,
  ): Promise<ContractTransaction> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - redeemToBacking() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    return this.contract.redeemToBacking(tempusPool, amountOfShares, amountOfShares, userWalletAddress);
  }

  async redeemToYieldBearing(
    tempusPool: string,
    userWalletAddress: string,
    amountOfShares: BigNumber,
  ): Promise<ContractTransaction> {
    if (!this.contract) {
      console.error(
        'TempusControllerService - redeemToYieldBearing() - Attempted to use TempusControllerService before initializing it!',
      );
      return Promise.reject();
    }

    return this.contract.redeemToYieldBearing(tempusPool, amountOfShares, amountOfShares, userWalletAddress);
  }
}
