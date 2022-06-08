import { BigNumber, utils } from 'ethers';

export const increasePrecision = (bigNum: BigNumber, increment: number): BigNumber => {
  const multiplicand = BigNumber.from(10).pow(increment);
  return bigNum.mul(multiplicand);
};

export const decreasePrecision = (bigNum: BigNumber, decrement: number): BigNumber => {
  const divisor = BigNumber.from(10).pow(decrement);
  return bigNum.div(divisor);
};

export type Numberish = Decimal | string | number | BigNumber;

export const DEFAULT_DECIMAL_PRECISION = 18;

export default class Decimal {
  readonly value: BigNumber;
  readonly precision = DEFAULT_DECIMAL_PRECISION;

  // TODO - Make second argument mandatory - we skip it in a lot of places
  // and code assumes that provided value has 18 decimals which is wrong
  constructor(value: Numberish, valuePrecision: number = DEFAULT_DECIMAL_PRECISION) {
    let bigNumberValue: BigNumber;

    if (value instanceof Decimal) {
      bigNumberValue = BigNumber.from(value.value);
    } else if (value instanceof BigNumber) {
      bigNumberValue = BigNumber.from(value);
    } else {
      try {
        bigNumberValue = utils.parseUnits(`${value}`, valuePrecision);
      } catch (e) {
        throw new Error(`Failed to parse ${value} when creating Decimal`);
      }
    }

    if (valuePrecision === DEFAULT_DECIMAL_PRECISION) {
      this.value = bigNumberValue;
    } else if (valuePrecision < DEFAULT_DECIMAL_PRECISION) {
      this.value = increasePrecision(bigNumberValue, DEFAULT_DECIMAL_PRECISION - valuePrecision);
    } else {
      this.value = decreasePrecision(bigNumberValue, valuePrecision - DEFAULT_DECIMAL_PRECISION);
    }
  }

  static parse(value: Numberish, defaultValue: Numberish = 0, valuePrecision = DEFAULT_DECIMAL_PRECISION): Decimal {
    try {
      return new Decimal(value, valuePrecision);
    } catch (e) {
      return new Decimal(defaultValue, valuePrecision);
    }
  }

  add(addend: Numberish): Decimal {
    const decimal = new Decimal(addend, DEFAULT_DECIMAL_PRECISION);

    return new Decimal(this.value.add(decimal.value), DEFAULT_DECIMAL_PRECISION);
  }

  sub(subtrahend: Numberish): Decimal {
    const decimal = new Decimal(subtrahend, DEFAULT_DECIMAL_PRECISION);

    return new Decimal(this.value.sub(decimal.value), DEFAULT_DECIMAL_PRECISION);
  }

  mul(multiplicand: Numberish): Decimal {
    const decimal = new Decimal(multiplicand, DEFAULT_DECIMAL_PRECISION);
    const product = decreasePrecision(this.value.mul(decimal.value), DEFAULT_DECIMAL_PRECISION);

    return new Decimal(product, DEFAULT_DECIMAL_PRECISION);
  }

  div(divisor: Numberish): Decimal {
    const decimal = new Decimal(divisor, DEFAULT_DECIMAL_PRECISION);
    const quotient = increasePrecision(this.value, DEFAULT_DECIMAL_PRECISION).div(decimal.value);

    return new Decimal(quotient, DEFAULT_DECIMAL_PRECISION);
  }

  abs(): Decimal {
    return new Decimal(this.value.abs(), DEFAULT_DECIMAL_PRECISION);
  }

  equals(comparable: Numberish): boolean {
    const decimal = new Decimal(comparable, DEFAULT_DECIMAL_PRECISION);

    return this.value.eq(decimal.value);
  }

  lt(another: Numberish): boolean {
    const decimal = new Decimal(another, DEFAULT_DECIMAL_PRECISION);

    return this.value.lt(decimal.value);
  }

  lte(another: Numberish): boolean {
    const decimal = new Decimal(another, DEFAULT_DECIMAL_PRECISION);

    return this.value.lte(decimal.value);
  }

  gt(another: Numberish): boolean {
    const decimal = new Decimal(another, DEFAULT_DECIMAL_PRECISION);

    return this.value.gt(decimal.value);
  }

  gte(another: Numberish): boolean {
    const decimal = new Decimal(another, DEFAULT_DECIMAL_PRECISION);

    return this.value.gte(decimal.value);
  }

  isZero(): boolean {
    return this.value.isZero();
  }

  toBigNumber(precision = DEFAULT_DECIMAL_PRECISION): BigNumber {
    if (precision === DEFAULT_DECIMAL_PRECISION) {
      return BigNumber.from(this.value);
    }
    if (DEFAULT_DECIMAL_PRECISION < precision) {
      return increasePrecision(this.value, precision - DEFAULT_DECIMAL_PRECISION);
    }
    return decreasePrecision(this.value, DEFAULT_DECIMAL_PRECISION - precision);
  }

  toString(): string {
    return utils.formatUnits(this.value, DEFAULT_DECIMAL_PRECISION).replace(/\.0*$/, '');
  }

  toRounded(fractionDigits = 0): string {
    const str = this.toString();
    const [integral, fraction = ''] = str.split('.');

    const lastDigit = fraction.charAt(fractionDigits);

    if (this.gte(0)) {
      // non-negative number
      if (Number(lastDigit) < 5) {
        // no need to be rounded
        return this.toTruncated(fractionDigits);
      }
      if (fractionDigits > 0) {
        // round to fractionDigits decimal places
        const bigNum = utils.parseUnits(`${integral}.${fraction.slice(0, fractionDigits)}`, fractionDigits);
        const strRounded = utils.formatUnits(bigNum.add(1), fractionDigits);
        const [outputIntegral, outputFraction] = strRounded.split('.');
        return `${outputIntegral}.${outputFraction.padEnd(fractionDigits, '0')}`;
      }
      // rounded as integer, simply +1
      return BigNumber.from(integral).add(1).toString();
    }
    // negative number
    if (Number(lastDigit) <= 5) {
      // no need to be rounded
      return this.toTruncated(fractionDigits);
    }
    if (fractionDigits > 0) {
      // round to fractionDigits decimal places
      const bigNum = utils.parseUnits(`${integral}.${fraction.slice(0, fractionDigits)}`, fractionDigits);
      const strRounded = utils.formatUnits(bigNum.sub(1), fractionDigits);
      const [outputIntegral, outputFraction] = strRounded.split('.');
      return `${outputIntegral}.${outputFraction.padEnd(fractionDigits, '0')}`;
    }
    // rounded as negative integer, simply -1
    return BigNumber.from(integral).sub(1).toString();
  }

  toTruncated(fractionDigits = 0): string {
    const str = this.toString();
    const [integral, fraction = ''] = str.split('.');

    if (fractionDigits > 0) {
      return `${integral}.${fraction.slice(0, fractionDigits).padEnd(fractionDigits, '0')}`;
    }
    return integral;
  }
}

export const ZERO = new Decimal(0, DEFAULT_DECIMAL_PRECISION);
export const ONE = new Decimal(1, DEFAULT_DECIMAL_PRECISION);
