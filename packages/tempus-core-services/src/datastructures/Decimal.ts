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

  // In case user passes BigNumber as value, we also need user to provide precision
  constructor(value: BigNumber, valuePrecision: number);
  // In case user passes (number | string | Decimal) as value, we don't need precision because
  // we can safely convert (number | string | Decimal) to BigNumber with 18 decimal precision.
  constructor(value: number | string | Decimal);

  // Constructor implementation
  constructor(value: Numberish, valuePrecision: number = DEFAULT_DECIMAL_PRECISION) {
    // In case we pass in Decimal, underlying value inside the Decimal is already 18 decimal precision
    if (value instanceof Decimal) {
      this.value = BigNumber.from(value.value);
      // In case we pass in BigNumber as value, need to convert it to 18 decimal
      // precision BigNumber before storing it inside value
    } else if (value instanceof BigNumber) {
      if (valuePrecision === DEFAULT_DECIMAL_PRECISION) {
        this.value = BigNumber.from(value);
      } else if (valuePrecision < DEFAULT_DECIMAL_PRECISION) {
        this.value = increasePrecision(BigNumber.from(value), DEFAULT_DECIMAL_PRECISION - valuePrecision);
      } else {
        this.value = decreasePrecision(BigNumber.from(value), valuePrecision - DEFAULT_DECIMAL_PRECISION);
      }
      // In case user passes (number | string), attempt to create BigNumber from passed value using parseUnits()
    } else {
      try {
        this.value = utils.parseUnits(`${value}`, valuePrecision);
      } catch (e) {
        throw new Error(`Failed to parse ${value} when creating Decimal`);
      }
    }
  }

  static parse(value: BigNumber, defaultValue: BigNumber, valuePrecision: number): Decimal;
  static parse(value: number | string | Decimal, defaultValue: number | string | Decimal): Decimal;
  static parse(value: Numberish, defaultValue: Numberish, valuePrecision = DEFAULT_DECIMAL_PRECISION): Decimal {
    try {
      if (value instanceof BigNumber) {
        return new Decimal(value, valuePrecision);
      }
      return new Decimal(value);
    } catch (e) {
      if (defaultValue instanceof BigNumber) {
        return new Decimal(defaultValue, valuePrecision);
      }
      return new Decimal(defaultValue);
    }
  }

  add(addend: number | string | Decimal): Decimal {
    const decimal = new Decimal(addend);

    return new Decimal(this.value.add(decimal.value), DEFAULT_DECIMAL_PRECISION);
  }

  sub(subtrahend: number | string | Decimal): Decimal {
    const decimal = new Decimal(subtrahend);

    return new Decimal(this.value.sub(decimal.value), DEFAULT_DECIMAL_PRECISION);
  }

  mul(multiplicand: number | string | Decimal): Decimal {
    const decimal = new Decimal(multiplicand);
    const product = decreasePrecision(this.value.mul(decimal.value), DEFAULT_DECIMAL_PRECISION);

    return new Decimal(product, DEFAULT_DECIMAL_PRECISION);
  }

  div(divisor: number | string | Decimal): Decimal {
    const decimal = new Decimal(divisor);
    const quotient = increasePrecision(this.value, DEFAULT_DECIMAL_PRECISION).div(decimal.value);

    return new Decimal(quotient, DEFAULT_DECIMAL_PRECISION);
  }

  abs(): Decimal {
    return new Decimal(this.value.abs(), DEFAULT_DECIMAL_PRECISION);
  }

  equals(comparable: number | string | Decimal): boolean {
    const decimal = new Decimal(comparable);

    return this.value.eq(decimal.value);
  }

  lt(another: number | string | Decimal): boolean {
    const decimal = new Decimal(another);

    return this.value.lt(decimal.value);
  }

  lte(another: number | string | Decimal): boolean {
    const decimal = new Decimal(another);

    return this.value.lte(decimal.value);
  }

  gt(another: number | string | Decimal): boolean {
    const decimal = new Decimal(another);

    return this.value.gt(decimal.value);
  }

  gte(another: number | string | Decimal): boolean {
    const decimal = new Decimal(another);

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

export const ZERO = new Decimal(0);
export const ONE = new Decimal(1);
