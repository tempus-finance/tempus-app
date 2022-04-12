import { BigNumber, utils } from 'ethers';
import { mul18f, div18f, increasePrecision, decreasePrecision } from './../utils/weiMath';

export default class TempusBigNumber {
  readonly value: BigNumber;
  readonly precision: number;

  constructor(value: string | number | BigNumber, precision: number = 18) {
    if (value instanceof BigNumber) {
      this.value = value;
    } else if (value === '.' || value === '') {
      this.value = BigNumber.from(0);
    } else {
      this.value = utils.parseUnits(`${value}`, precision);
    }
    this.precision = precision;
  }

  add(addend: TempusBigNumber | string | number | BigNumber): TempusBigNumber {
    const tbignum = addend instanceof TempusBigNumber ? addend : new TempusBigNumber(addend);

    if (this.precision === tbignum.precision) {
      return new TempusBigNumber(this.value.add(tbignum.value), this.precision);
    } else if (this.precision < tbignum.precision) {
      const sum = increasePrecision(this.value, tbignum.precision - this.precision).add(tbignum.value);
      return new TempusBigNumber(sum, tbignum.precision);
    } else {
      const sum = this.value.add(increasePrecision(tbignum.value, this.precision - tbignum.precision));
      return new TempusBigNumber(sum, this.precision);
    }
  }

  sub(subtrahend: TempusBigNumber | string | number | BigNumber): TempusBigNumber {
    const tbignum = subtrahend instanceof TempusBigNumber ? subtrahend : new TempusBigNumber(subtrahend);

    if (this.precision === tbignum.precision) {
      return new TempusBigNumber(this.value.sub(tbignum.value), this.precision);
    } else if (this.precision < tbignum.precision) {
      const diff = increasePrecision(this.value, tbignum.precision - this.precision).sub(tbignum.value);
      return new TempusBigNumber(diff, tbignum.precision);
    } else {
      const diff = this.value.sub(increasePrecision(tbignum.value, this.precision - tbignum.precision));
      return new TempusBigNumber(diff, this.precision);
    }
  }

  mul(multiplicand: TempusBigNumber | string | number | BigNumber): TempusBigNumber {
    const tbignum = multiplicand instanceof TempusBigNumber ? multiplicand : new TempusBigNumber(multiplicand);

    if (this.precision === tbignum.precision) {
      return new TempusBigNumber(mul18f(this.value, tbignum.value, this.precision));
    } else if (this.precision < tbignum.precision) {
      const product = mul18f(
        increasePrecision(this.value, tbignum.precision - this.precision),
        tbignum.value,
        tbignum.precision,
      );
      return new TempusBigNumber(product, tbignum.precision);
    } else {
      const product = mul18f(
        this.value,
        increasePrecision(tbignum.value, this.precision - tbignum.precision),
        this.precision,
      );
      return new TempusBigNumber(product, this.precision);
    }
  }

  div(divisor: TempusBigNumber | string | number | BigNumber): TempusBigNumber {
    const tbignum = divisor instanceof TempusBigNumber ? divisor : new TempusBigNumber(divisor);

    if (this.precision === tbignum.precision) {
      return new TempusBigNumber(div18f(this.value, tbignum.value, this.precision));
    } else if (this.precision < tbignum.precision) {
      const quotient = div18f(
        increasePrecision(this.value, tbignum.precision - this.precision),
        tbignum.value,
        tbignum.precision,
      );
      return new TempusBigNumber(quotient, tbignum.precision);
    } else {
      const quotient = div18f(
        this.value,
        increasePrecision(tbignum.value, this.precision - tbignum.precision),
        this.precision,
      );
      return new TempusBigNumber(quotient, this.precision);
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

  toNumber(): number {
    return this.value.toNumber();
  }

  toString(): string {
    return utils.formatUnits(this.value, this.precision);
  }

  toFixed(fractionDigits: number = 0, roundValue?: boolean): string {
    const str = this.toString();
    const [integral, fraction] = str.split('.');

    if (!roundValue) {
      if (fractionDigits > 0) {
        return `${integral}.${fraction.slice(0, fractionDigits).padEnd(fractionDigits, '0')}`;
      } else {
        return integral;
      }
    } else {
      const lastDigit = fraction.charAt(fractionDigits);
      if (Number(lastDigit) < 5) {
        if (fractionDigits > 0) {
          return `${integral}.${fraction.slice(0, fractionDigits).padEnd(fractionDigits, '0')}`;
        } else {
          return integral;
        }
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
  }
}
