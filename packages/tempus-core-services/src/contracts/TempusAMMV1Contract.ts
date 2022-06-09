import { Contract } from 'ethers';
import { from, map, Observable } from 'rxjs';
import TempusAMMV1ABI from '../abi/TempusAMMV1ABI.json';
import { TempusAMM as TempusAMMV1 } from '../abi/TempusAMMV1Typings';
import { Decimal } from '../datastructures';
import { Chain } from '../interfaces';
import { getDefaultProvider } from '../services';

export class TempusAMMV1Contract {
  private contractAddress: string;
  private contract: TempusAMMV1;

  constructor(chain: Chain, contractAddress: string) {
    this.contractAddress = contractAddress;

    const provider = getDefaultProvider(chain);

    this.contract = new Contract(this.contractAddress, TempusAMMV1ABI, provider) as TempusAMMV1;
  }

  getExpectedReturnGivenIn(
    amount: Decimal,
    yieldShareIn: boolean,
    capitalsPrecision: number,
    yieldsPrecision: number,
  ): Observable<Decimal> {
    const inPrecision = yieldShareIn ? yieldsPrecision : capitalsPrecision;
    const outPrecision = yieldShareIn ? capitalsPrecision : yieldsPrecision;

    return from(this.contract.getExpectedReturnGivenIn(amount.toBigNumber(inPrecision), yieldShareIn)).pipe(
      map(result => new Decimal(result, outPrecision)),
    );
  }
}
