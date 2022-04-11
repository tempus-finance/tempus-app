import { ComponentMeta, ComponentStory } from '@storybook/react';
import { BigNumber } from 'ethers';
import { increasePrecision, Ticker } from 'tempus-core-services';
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

const singleCurrencyUsdRates = new Map<Ticker, BigNumber>();
singleCurrencyUsdRates.set('ETH', BigNumber.from(350000));

const multipleCurrencyUsdRates = new Map<Ticker, BigNumber>();
multipleCurrencyUsdRates.set('ETH', BigNumber.from(350000));
multipleCurrencyUsdRates.set('stETH', BigNumber.from(350100));

const Template: ComponentStory<typeof CurrencyInput> = props => <CurrencyInput {...props} />;

export const SingleCurrencyInput = Template.bind({});
SingleCurrencyInput.args = {
  usdRates: singleCurrencyUsdRates,
  precision: 18,
  ratePrecision: 2,
  maxAmount: increasePrecision(BigNumber.from(100), 18),
};

export const MultiCurrencyInput = Template.bind({});
MultiCurrencyInput.args = {
  usdRates: multipleCurrencyUsdRates,
  precision: 18,
  ratePrecision: 2,
  maxAmount: increasePrecision(BigNumber.from(100), 18),
};

export const DisabledSingleCurrencyInput = Template.bind({});
DisabledSingleCurrencyInput.args = {
  usdRates: singleCurrencyUsdRates,
  precision: 18,
  ratePrecision: 2,
  maxAmount: increasePrecision(BigNumber.from(100), 18),
  disabled: true,
};

export const DisabledMultiCurrencyInput = Template.bind({});
DisabledMultiCurrencyInput.args = {
  usdRates: multipleCurrencyUsdRates,
  precision: 18,
  ratePrecision: 2,
  maxAmount: increasePrecision(BigNumber.from(100), 18),
  disabled: true,
};

export const SingleCurrencyInputWithError = Template.bind({});
SingleCurrencyInputWithError.args = {
  usdRates: singleCurrencyUsdRates,
  precision: 18,
  ratePrecision: 2,
  maxAmount: increasePrecision(BigNumber.from(100), 18),
  error: 'Value is too low',
};
