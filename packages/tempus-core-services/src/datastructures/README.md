# Data Structure
### `FixedPointDecimal`
`FixedPointDecimal` is an abstract representation of the daily use fixed point number, which underlying implementation are `ethers/BigNumber` with a `precision`.
Instead of dealing with a pair of `ethers/BigNumber` and `precision`, we should use `FixedPointDecimal` for handling numbers and calculations.
#### Constrcutor()
```
const decimal1 = new FixedPointDecimal(123, 6);
// decimal1 = { value: 123000000, precision: 6 }
const decimal2 = new FixedPointDecimal('123', 12);
// decimal2 = { value: 123000000000000, precision: 12 }
const decimal3 = new FixedPointDecimal(BigNumber.from('123'), 18);
// decimal3 = { value: 123000000000000000000, precision: 18 }
const decimal4 = new FixedPointDecimal(123);
// decimal4 = { value: 123000000000000000000, precision: 18 }
```
| Param | Type | Mandatory | Default |
| ----------- | ----------- | ----------- | ----------- |
| value | string \| number \| BigNumber | yes ||
| precision | number | no | 18 |
#### Calculation
```
const decimal1 = new FixedPointDecimal(123, 12).add(456);
// decimal1 = { value: 579000000000000000000, precision: 18 }
const decimal2 = new FixedPointDecimal(789, 6).sub('123');
// decimal2 = { value: 666000000000000000000, precision: 18 }
const decimal3 = new FixedPointDecimal(12, 18).mul(BigNumber.from('34'));
// decimal3 = { value: 408000000000000000000, precision: 18 }
const decimal4 = new FixedPointDecimal(72, 6).div(new FixedPointDecimal(12, 12));
// decimal4 = { value: 6000000000000, precision: 12 }
```
##### add()
add a number, return a `FixedPointDecimal` with the higher precision from 2 numbers.
| Param | Type | Mandatory | Default |
| ----------- | ----------- | ----------- | ----------- |
| addend | string \| number \| BigNumber \| FixedPointDecimal | yes ||

##### sub()
subtract a number, return a `FixedPointDecimal` with the higher precision from 2 numbers.
| Param | Type | Mandatory | Default |
| ----------- | ----------- | ----------- | ----------- |
| subtrahend | string \| number \| BigNumber \| FixedPointDecimal | yes ||

##### mul()
multiply a number, return a `FixedPointDecimal` with the higher precision from 2 numbers.
| Param | Type | Mandatory | Default |
| ----------- | ----------- | ----------- | ----------- |
| multiplicand | string \| number \| BigNumber \| FixedPointDecimal | yes ||

##### div()
divided by a number, return a `FixedPointDecimal` with the higher precision from 2 numbers.
| Param | Type | Mandatory | Default |
| ----------- | ----------- | ----------- | ----------- |
| divisor | string \| number \| BigNumber \| FixedPointDecimal | yes ||

#### Conversion
```
const decimal1 = new FixedPointDecimal(123.123, 12).toBigNumber(6);
// decimal1 = 123123000
const decimal2 = new FixedPointDecimal(123.123, 6).toString();
// decimal2 = '123.123'
const decimal3 = new FixedPointDecimal(789.789).toRounded(2);
// decimal3 = '789.79'
const decimal4 = new FixedPointDecimal(789.789).toTruncated(2);
// decimal4 = '789.78'
```