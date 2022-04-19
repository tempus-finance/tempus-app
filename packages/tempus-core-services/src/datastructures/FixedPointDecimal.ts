import { BigNumber, utils } from 'ethers';
import { DEFAULT_TOKEN_PRECISION } from '../constants';

const increasePrecision = (bigNum: BigNumber, increment: number): BigNumber => {
  const multiplicand = BigNumber.from(10).pow(increment);
  return bigNum.mul(multiplicand);
};

const decreasePrecision = (bigNum: BigNumber, decrement: number): BigNumber => {
  const divisor = BigNumber.from(10).pow(decrement);
  return bigNum.div(divisor);
};

export type Numberish = FixedPointDecimal | string | number | BigNumber;

export default class FixedPointDecimal {
  readonly value: BigNumber;
  readonly precision: number = DEFAULT_TOKEN_PRECISION;

  constructor(value: Numberish) {
    if (value instanceof FixedPointDecimal) {
      this.value = BigNumber.from(value.value);
    } else if (value instanceof BigNumber) {
      this.value = BigNumber.from(value);
    } else {
      try {
        this.value = utils.parseUnits(`${value}`, this.precision);
      } catch (e) {
        throw new Error(`Failed to parse ${value} when creating FixedPointDecimal`);
      }
    }
  }

  add(addend: Numberish): FixedPointDecimal {
    const decimal = new FixedPointDecimal(addend);

    return new FixedPointDecimal(this.value.add(decimal.value));
  }

  sub(subtrahend: Numberish): FixedPointDecimal {
    const decimal = new FixedPointDecimal(subtrahend);

    return new FixedPointDecimal(this.value.sub(decimal.value));
  }

  mul(multiplicand: Numberish): FixedPointDecimal {
    const decimal = new FixedPointDecimal(multiplicand);
    const product = decreasePrecision(this.value.mul(decimal.value), this.precision);

    return new FixedPointDecimal(product);
  }

  div(divisor: Numberish): FixedPointDecimal {
    const decimal = new FixedPointDecimal(divisor);
    const quotient = increasePrecision(this.value, this.precision).div(decimal.value);

    return new FixedPointDecimal(quotient);
  }

  toBigNumber(precision: number = DEFAULT_TOKEN_PRECISION): BigNumber {
    if (this.precision === precision) {
      return BigNumber.from(this.value);
    } else if (this.precision < precision) {
      return increasePrecision(this.value, precision - this.precision);
    } else {
      return decreasePrecision(this.value, this.precision - precision);
    }
  }

  toString(): string {
    return utils.formatUnits(this.value, this.precision);
  }

  toRounded(fractionDigits: number = 0): string {
    const str = this.toString();
    const [integral, fraction] = str.split('.');

    const lastDigit = fraction.charAt(fractionDigits);
    if (Number(lastDigit) < 5) {
      return this.toTruncated(fractionDigits);
    } else {
      if (fractionDigits > 0) {
        const bigNum = utils.parseUnits(`${integral}.${fraction.slice(0, fractionDigits)}`, fractionDigits);
        const str = utils.formatUnits(bigNum.add(1), fractionDigits);
        const [outputIntegral, outputFraction] = str.split('.');
        return `${outputIntegral}.${outputFraction.padEnd(fractionDigits, '0')}`;
      } else {
        return BigNumber.from(integral).add(1).toString();
      }
    }
  }

  toTruncated(fractionDigits: number = 0): string {
    const str = this.toString();
    const [integral, fraction] = str.split('.');

    if (fractionDigits > 0) {
      return `${integral}.${fraction.slice(0, fractionDigits).padEnd(fractionDigits, '0')}`;
    } else {
      return integral;
    }
  }
}
