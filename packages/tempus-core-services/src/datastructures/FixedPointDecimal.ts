import { BigNumber, utils } from 'ethers';

const increasePrecision = (bignum: BigNumber, precision: number): BigNumber => {
  const multiplicand = BigNumber.from(BigNumber.from(10).pow(precision));
  return bignum.mul(multiplicand);
};

const decreasePrecision = (bignum: BigNumber, precision: number): BigNumber => {
  const divisor = BigNumber.from(BigNumber.from(10).pow(precision));
  return bignum.div(divisor);
};

export default class FixedPointDecimal {
  readonly value: BigNumber;
  readonly precision: number;

  constructor(value: string | number | BigNumber, precision: number = 18) {
    if (value instanceof BigNumber) {
      this.value = value;
    } else {
      try {
        this.value = utils.parseUnits(`${value}`, precision);
      } catch (e) {
        throw new Error(`Failed to parse ${value} when creating FixedPointDecimal`);
      }
    }
    this.precision = precision;
  }

  add(addend: FixedPointDecimal | string | number | BigNumber): FixedPointDecimal {
    const decimal = addend instanceof FixedPointDecimal ? addend : new FixedPointDecimal(addend);
    const higherPrecision = Math.max(this.precision, decimal.precision);
    const adjustedThisBignum = this.toBigNumber(higherPrecision);
    const adjustedAddendBignum = decimal.toBigNumber(higherPrecision);

    return new FixedPointDecimal(adjustedThisBignum.add(adjustedAddendBignum), higherPrecision);
  }

  sub(subtrahend: FixedPointDecimal | string | number | BigNumber): FixedPointDecimal {
    const decimal = subtrahend instanceof FixedPointDecimal ? subtrahend : new FixedPointDecimal(subtrahend);
    const higherPrecision = Math.max(this.precision, decimal.precision);
    const adjustedThisBignum = this.toBigNumber(higherPrecision);
    const adjustedSubtrahendBignum = decimal.toBigNumber(higherPrecision);

    return new FixedPointDecimal(adjustedThisBignum.sub(adjustedSubtrahendBignum), higherPrecision);
  }

  mul(multiplicand: FixedPointDecimal | string | number | BigNumber): FixedPointDecimal {
    const decimal = multiplicand instanceof FixedPointDecimal ? multiplicand : new FixedPointDecimal(multiplicand);
    const higherPrecision = Math.max(this.precision, decimal.precision);
    const adjustedThisBignum = this.toBigNumber(higherPrecision);
    const adjustedMultiplicandBignum = decimal.toBigNumber(higherPrecision);
    const product = decreasePrecision(adjustedThisBignum.mul(adjustedMultiplicandBignum), higherPrecision);

    return new FixedPointDecimal(product, higherPrecision);
  }

  div(divisor: FixedPointDecimal | string | number | BigNumber): FixedPointDecimal {
    const decimal = divisor instanceof FixedPointDecimal ? divisor : new FixedPointDecimal(divisor);
    const higherPrecision = Math.max(this.precision, decimal.precision);
    const adjustedThisBignum = this.toBigNumber(higherPrecision);
    const adjustedDivisorBignum = decimal.toBigNumber(higherPrecision);
    const quotient = increasePrecision(adjustedThisBignum, higherPrecision).div(adjustedDivisorBignum);

    return new FixedPointDecimal(quotient, higherPrecision);
  }

  toBigNumber(precision: number = 18): BigNumber {
    if (this.precision === precision) {
      return this.value;
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
        const bignum = utils.parseUnits(`${integral}.${fraction.slice(0, fractionDigits)}`, fractionDigits);
        const str = utils.formatUnits(bignum.add(1), fractionDigits);
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
