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

    if (this.precision === decimal.precision) {
      return new FixedPointDecimal(this.value.add(decimal.value), this.precision);
    } else if (this.precision < decimal.precision) {
      const sum = increasePrecision(this.value, decimal.precision - this.precision).add(decimal.value);
      return new FixedPointDecimal(sum, decimal.precision);
    } else {
      const sum = this.value.add(increasePrecision(decimal.value, this.precision - decimal.precision));
      return new FixedPointDecimal(sum, this.precision);
    }
  }

  sub(subtrahend: FixedPointDecimal | string | number | BigNumber): FixedPointDecimal {
    const decimal = subtrahend instanceof FixedPointDecimal ? subtrahend : new FixedPointDecimal(subtrahend);

    if (this.precision === decimal.precision) {
      return new FixedPointDecimal(this.value.sub(decimal.value), this.precision);
    } else if (this.precision < decimal.precision) {
      const diff = increasePrecision(this.value, decimal.precision - this.precision).sub(decimal.value);
      return new FixedPointDecimal(diff, decimal.precision);
    } else {
      const diff = this.value.sub(increasePrecision(decimal.value, this.precision - decimal.precision));
      return new FixedPointDecimal(diff, this.precision);
    }
  }

  mul(multiplicand: FixedPointDecimal | string | number | BigNumber): FixedPointDecimal {
    const decimal = multiplicand instanceof FixedPointDecimal ? multiplicand : new FixedPointDecimal(multiplicand);

    if (this.precision === decimal.precision) {
      const product = decreasePrecision(this.value.mul(decimal.value), this.precision);
      return new FixedPointDecimal(product, this.precision);
    } else if (this.precision < decimal.precision) {
      const product = decreasePrecision(
        increasePrecision(this.value, decimal.precision - this.precision).mul(decimal.value),
        decimal.precision,
      );
      return new FixedPointDecimal(product, decimal.precision);
    } else {
      const product = decreasePrecision(
        this.value.mul(increasePrecision(decimal.value, this.precision - decimal.precision)),
        this.precision,
      );
      return new FixedPointDecimal(product, this.precision);
    }
  }

  div(divisor: FixedPointDecimal | string | number | BigNumber): FixedPointDecimal {
    const decimal = divisor instanceof FixedPointDecimal ? divisor : new FixedPointDecimal(divisor);

    if (this.precision === decimal.precision) {
      const quotient = increasePrecision(this.value, this.precision).div(decimal.value);
      return new FixedPointDecimal(quotient, this.precision);
    } else if (this.precision < decimal.precision) {
      const quotient = increasePrecision(
        increasePrecision(this.value, decimal.precision - this.precision),
        decimal.precision,
      ).div(decimal.value);
      return new FixedPointDecimal(quotient, decimal.precision);
    } else {
      const quotient = increasePrecision(this.value, this.precision).div(
        increasePrecision(decimal.value, this.precision - decimal.precision),
      );
      return new FixedPointDecimal(quotient, this.precision);
    }
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
