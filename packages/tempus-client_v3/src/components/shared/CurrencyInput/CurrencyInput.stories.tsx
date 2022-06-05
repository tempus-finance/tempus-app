import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Decimal, Ticker } from 'tempus-core-services';
import CurrencyInput from './CurrencyInput';

export default {
  title: 'CurrencyInput',
  component: CurrencyInput,
  argTypes: {
    usdRates: {
      control: {
        type: 'object',
      },
    },
    precision: {
      control: {
        type: 'number',
      },
    },
    ratePrecision: {
      control: {
        type: 'number',
      },
    },
    disabled: {
      control: {
        type: 'boolean',
      },
    },
    error: {
      control: {
        type: 'text',
      },
    },
  },
} as ComponentMeta<typeof CurrencyInput>;

const singleCurrencyUsdRates = new Map<Ticker, Decimal>();
singleCurrencyUsdRates.set('ETH', new Decimal(3500));

const multipleCurrencyUsdRates = new Map<Ticker, Decimal>();
multipleCurrencyUsdRates.set('ETH', new Decimal(3500));
multipleCurrencyUsdRates.set('stETH', new Decimal(3501));

const Template: ComponentStory<typeof CurrencyInput> = props => <CurrencyInput {...props} />;

export const SingleCurrencyInput = Template.bind({});
SingleCurrencyInput.args = {
  tokens: [
    {
      precision: 18,
      precisionForUI: 4,
      address: '1',
      rate: new Decimal(3500),
      ticker: 'ETH',
    },
    {
      precision: 18,
      precisionForUI: 4,
      address: '2',
      rate: new Decimal(3501),
      ticker: 'stETH',
    },
  ],
  maxAmount: new Decimal(100),
};

export const MultiCurrencyInput = Template.bind({});
MultiCurrencyInput.args = {
  tokens: [
    {
      precision: 18,
      precisionForUI: 4,
      address: '1',
      rate: new Decimal(3500),
      ticker: 'ETH',
    },
    {
      precision: 18,
      precisionForUI: 4,
      address: '2',
      rate: new Decimal(3501),
      ticker: 'stETH',
    },
  ],
  maxAmount: new Decimal(100),
};

export const DisabledSingleCurrencyInput = Template.bind({});
DisabledSingleCurrencyInput.args = {
  tokens: [
    {
      precision: 18,
      precisionForUI: 4,
      address: '1',
      rate: new Decimal(3500),
      ticker: 'ETH',
    },
    {
      precision: 18,
      precisionForUI: 4,
      address: '2',
      rate: new Decimal(3501),
      ticker: 'stETH',
    },
  ],
  maxAmount: new Decimal(100),
  disabled: true,
};

export const DisabledMultiCurrencyInput = Template.bind({});
DisabledMultiCurrencyInput.args = {
  tokens: [
    {
      precision: 18,
      precisionForUI: 4,
      address: '1',
      rate: new Decimal(3500),
      ticker: 'ETH',
    },
    {
      precision: 18,
      precisionForUI: 4,
      address: '2',
      rate: new Decimal(3501),
      ticker: 'stETH',
    },
  ],
  maxAmount: new Decimal(100),
  disabled: true,
};

export const SingleCurrencyInputWithError = Template.bind({});
SingleCurrencyInputWithError.args = {
  tokens: [
    {
      precision: 18,
      precisionForUI: 4,
      address: '1',
      rate: new Decimal(3500),
      ticker: 'ETH',
    },
    {
      precision: 18,
      precisionForUI: 4,
      address: '2',
      rate: new Decimal(3501),
      ticker: 'stETH',
    },
  ],
  maxAmount: new Decimal(100),
  error: 'Value is too low',
};
