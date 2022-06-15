import { CallOverrides, Contract, ContractTransaction } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { TempusController as TempusControllerV1 } from '../abi/TempusControllerV1Typings';
import TempusControllerV1ABI from '../abi/TempusControllerV1ABI.json';
import { Decimal } from '../datastructures';
import { Chain, Ticker } from '../interfaces';
import { getDefaultProvider } from '../services';
import { DEADLINE_PRECISION } from '../constants';

export class TempusControllerV1Contract {
  private contractAddress: string;
  private contract: TempusControllerV1;

  constructor(chain: Chain, contractAddress: string, signer?: JsonRpcSigner | JsonRpcProvider) {
    this.contractAddress = contractAddress;

    const provider = getDefaultProvider(chain);

    this.contract = new Contract(this.contractAddress, TempusControllerV1ABI, signer || provider) as TempusControllerV1;
  }

  exitAmmGiveLpAndRedeem(
    ammAddress: string,
    lpTokensAmount: Decimal,
    capitalsAmount: Decimal,
    yieldsAmount: Decimal,
    lpPrecision: number,
    capitalsPrecision: number,
    yieldsPrecision: number,
    slippagePrecision: number,
    minCapitalsStaked: Decimal,
    minYieldsStaked: Decimal,
    maxLeftoverShares: Decimal,
    yieldsRate: Decimal,
    maxSlippage: Decimal,
    toBackingToken: boolean,
    deadline: Decimal,
  ): Promise<ContractTransaction> {
    return this.contract.exitAmmGivenLpAndRedeem(
      ammAddress,
      lpTokensAmount.toBigNumber(lpPrecision),
      capitalsAmount.toBigNumber(capitalsPrecision),
      yieldsAmount.toBigNumber(yieldsPrecision),
      minCapitalsStaked.toBigNumber(capitalsPrecision),
      minYieldsStaked.toBigNumber(yieldsPrecision),
      maxLeftoverShares.toBigNumber(capitalsPrecision),
      yieldsRate.toBigNumber(yieldsPrecision),
      maxSlippage.toBigNumber(slippagePrecision),
      toBackingToken,
      deadline.toBigNumber(DEADLINE_PRECISION),
    );
  }

  depositAndFix(
    ammAddress: string,
    tokenAmount: Decimal,
    tokenTicker: Ticker,
    tokenPrecision: number,
    yieldsPrecision: number,
    isBackingToken: boolean,
    minTYSRate: Decimal,
    deadline: Decimal,
  ): Promise<ContractTransaction> {
    let overrides: CallOverrides = {};
    if (tokenTicker === 'ETH') {
      overrides = {
        value: tokenAmount.toBigNumber(tokenPrecision),
      };
    }

    return this.contract.depositAndFix(
      ammAddress,
      tokenAmount.toBigNumber(tokenPrecision),
      isBackingToken,
      minTYSRate.toBigNumber(yieldsPrecision),
      deadline.toBigNumber(DEADLINE_PRECISION),
      overrides,
    );
  }
}
