import { Contract, ContractTransaction } from 'ethers';
import { from, Observable } from 'rxjs';
import { TempusController as TempusControllerV1 } from '../abi/TempusControllerV1Typings';
import TempusControllerV1ABI from '../abi/TempusControllerV1ABI.json';
import { Decimal } from '../datastructures';
import { Chain } from '../interfaces';
import { getDefaultProvider } from '../services';

export class TempusControllerV1Contract {
  private contractAddress: string;
  private contract: TempusControllerV1;

  constructor(chain: Chain, contractAddress: string) {
    this.contractAddress = contractAddress;

    const provider = getDefaultProvider(chain);

    this.contract = new Contract(this.contractAddress, TempusControllerV1ABI, provider) as TempusControllerV1;
  }

  exitAmmGiveLpAndRedeem(
    ammAddress: string,
    lpTokensAmount: Decimal,
    capitalsAmount: Decimal,
    yieldsAmount: Decimal,
    minCapitalsStaked: Decimal,
    minYieldsStaked: Decimal,
    maxLeftoverShares: Decimal,
    yieldsRate: Decimal,
    maxSlippage: Decimal,
    toBackingToken: boolean,
    deadline: Decimal,
  ): Observable<ContractTransaction> {
    return from(
      this.contract.exitAmmGivenLpAndRedeem(
        ammAddress,
        lpTokensAmount.toBigNumber(),
        capitalsAmount.toBigNumber(),
        yieldsAmount.toBigNumber(),
        minCapitalsStaked.toBigNumber(),
        minYieldsStaked.toBigNumber(),
        maxLeftoverShares.toBigNumber(),
        yieldsRate.toBigNumber(),
        maxSlippage.toBigNumber(),
        toBackingToken,
        deadline.toBigNumber(),
      ),
    );
  }
}
