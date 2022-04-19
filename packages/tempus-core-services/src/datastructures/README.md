# Data Structure
### `Decimal`
`Decimal` is an abstract representation of the daily use fixed point number, which underlying implementation are `ethers/BigNumber` with a `precision`.
Instead of dealing with a pair of `ethers/BigNumber` and `precision`, we should use `Decimal` for handling numbers and calculations.
`Decimal` stores number with `precision = 18`.
#### Constrcutor()
```
const decimal1 = new Decimal(123);
// decimal1 = { value: 123000000000000000000, precision: 18 }
const decimal2 = new Decimal('123');
// decimal2 = { value: 123000000000000000000, precision: 18 }
const decimal3 = new Decimal(BigNumber.from('123'));
// decimal3 = { value: 123000000000000000000, precision: 18 }
```
| Param | Type | Mandatory | Default |
| ----------- | ----------- | ----------- | ----------- |
| value | string \| number \| BigNumber |\ Decimal | yes ||
#### Calculation
```
const decimal1 = new Decimal(123).add(456);
// decimal1 = { value: 579000000000000000000, precision: 18 }
const decimal2 = new Decimal(789).sub('123');
// decimal2 = { value: 666000000000000000000, precision: 18 }
const decimal3 = new Decimal(12).mul(BigNumber.from('34'));
// decimal3 = { value: 408000000000000000000, precision: 18 }
const decimal4 = new Decimal(72).div(new Decimal(12));
// decimal4 = { value: 6000000000000000000, precision: 18 }
```
##### add()
add a number, return a `Decimal`.
| Param | Type | Mandatory | Default |
| ----------- | ----------- | ----------- | ----------- |
| addend | string \| number \| BigNumber \| Decimal | yes ||

##### sub()
subtract a number, return a `Decimal`.
| Param | Type | Mandatory | Default |
| ----------- | ----------- | ----------- | ----------- |
| subtrahend | string \| number \| BigNumber \| Decimal | yes ||

##### mul()
multiply a number, return a `Decimal`.
| Param | Type | Mandatory | Default |
| ----------- | ----------- | ----------- | ----------- |
| multiplicand | string \| number \| BigNumber \| Decimal | yes ||

##### div()
divided by a number, return a `Decimal`.
| Param | Type | Mandatory | Default |
| ----------- | ----------- | ----------- | ----------- |
| divisor | string \| number \| BigNumber \| Decimal | yes ||

#### Conversion
```
const decimal1 = new Decimal(123.123).toBigNumber(6);
// decimal1 = 123123000
const decimal2 = new Decimal(123.123).toString();
// decimal2 = '123.123'
const decimal3 = new Decimal(789.789).toRounded(2);
// decimal3 = '789.79'
const decimal4 = new Decimal(789.789).toTruncated(2);
// decimal4 = '789.78'
```