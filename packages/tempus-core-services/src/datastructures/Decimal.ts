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

export type Numberish = Decimal | string | number | BigNumber;

export default class Decimal {
  readonly value: BigNumber;
  readonly precision: number = DEFAULT_TOKEN_PRECISION;

  constructor(value: Numberish) {
    if (value instanceof Decimal) {
      this.value = BigNumber.from(value.value);
    } else if (value instanceof BigNumber) {
      this.value = BigNumber.from(value);
    } else {
      try {
        this.value = utils.parseUnits(`${value}`, this.precision);
      } catch (e) {
        throw new Error(`Failed to parse ${value} when creating Decimal`);
      }
    }
  }

  static parse(value: Numberish, defaultValue: Numberish = 0) {
    try {
      return new Decimal(value);
    } catch (e) {
      return new Decimal(defaultValue);
    }
  }

  add(addend: Numberish): Decimal {
    const decimal = new Decimal(addend);

    return new Decimal(this.value.add(decimal.value));
  }

  sub(subtrahend: Numberish): Decimal {
    const decimal = new Decimal(subtrahend);

    return new Decimal(this.value.sub(decimal.value));
  }

  mul(multiplicand: Numberish): Decimal {
    const decimal = new Decimal(multiplicand);
    const product = decreasePrecision(this.value.mul(decimal.value), this.precision);

    return new Decimal(product);
  }

  div(divisor: Numberish): Decimal {
    const decimal = new Decimal(divisor);
    const quotient = increasePrecision(this.value, this.precision).div(decimal.value);

    return new Decimal(quotient);
  }

  abs(): Decimal {
    return new Decimal(this.value.abs());
  }

  lt(another: Numberish): boolean {
    const decimal = new Decimal(another);

    return this.value.lt(decimal.value);
  }

  lte(another: Numberish): boolean {
    const decimal = new Decimal(another);

    return this.value.lte(decimal.value);
  }

  gt(another: Numberish): boolean {
    const decimal = new Decimal(another);

    return this.value.gt(decimal.value);
  }

  gte(another: Numberish): boolean {
    const decimal = new Decimal(another);

    return this.value.gte(decimal.value);
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
    return utils.formatUnits(this.value, this.precision).replace(/\.0*$/, '');
  }

  toRounded(fractionDigits: number = 0): string {
    const str = this.toString();
    const [integral, fraction = ''] = str.split('.');

    const lastDigit = fraction.charAt(fractionDigits);

    if (this.gte(0)) {
      // non-negative number
      if (Number(lastDigit) < 5) {
        // no need to be rounded
        return this.toTruncated(fractionDigits);
      } else {
        if (fractionDigits > 0) {
          // round to fractionDigits decimal places
          const bigNum = utils.parseUnits(`${integral}.${fraction.slice(0, fractionDigits)}`, fractionDigits);
          const str = utils.formatUnits(bigNum.add(1), fractionDigits);
          const [outputIntegral, outputFraction] = str.split('.');
          return `${outputIntegral}.${outputFraction.padEnd(fractionDigits, '0')}`;
        } else {
          // rounded as integer, simply +1
          return BigNumber.from(integral).add(1).toString();
        }
      }
    } else {
      // negative number
      if (Number(lastDigit) <= 5) {
        // no need to be rounded
        return this.toTruncated(fractionDigits);
      } else {
        if (fractionDigits > 0) {
          // round to fractionDigits decimal places
          const bigNum = utils.parseUnits(`${integral}.${fraction.slice(0, fractionDigits)}`, fractionDigits);
          const str = utils.formatUnits(bigNum.sub(1), fractionDigits);
          const [outputIntegral, outputFraction] = str.split('.');
          return `${outputIntegral}.${outputFraction.padEnd(fractionDigits, '0')}`;
        } else {
          // rounded as negative integer, simply -1
          return BigNumber.from(integral).sub(1).toString();
        }
      }
    }
  }

  toTruncated(fractionDigits: number = 0): string {
    const str = this.toString();
    const [integral, fraction = ''] = str.split('.');

    if (fractionDigits > 0) {
      return `${integral}.${fraction.slice(0, fractionDigits).padEnd(fractionDigits, '0')}`;
    } else {
      return integral;
    }
  }
}
