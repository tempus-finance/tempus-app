import { render } from '@testing-library/react';
import Logo, { LogoType } from './Logo';
import LogoProps from './LogoProps';

const defaultProps: LogoProps = {};

const subject = (props: LogoProps & { type: LogoType }) => render(<Logo {...props} />);

describe('Logo', () => {
  [
    'token-ETH',
    'token-ETH-light',
    'token-USDC',
    'token-USDT',
    'token-DAI',
    'token-FTM',
    'token-MIM',
    'token-RARI',
    'token-YFI',
    'token-wBTC',
    'token-wBTC-dark',
    'token-wETH',
    'token-wFTM',
    'token-stETH',
    'token-yvUSDC',
    'token-yvUSDT',
    'token-yvDAI',
    'token-yvBTC',
    'token-yvYFI',
    'token-yvwETH',
    'protocol-aave',
    'protocol-lido',
    'protocol-rari',
    'protocol-yearn',
    'protocol-compound',
    'wallet-metamask',
    'wallet-walletconnect',
    'wallet-gnosis',
  ].forEach(type => {
    it(`renders a logo with type ${type}`, () => {
      const { container } = subject({ ...defaultProps, type: type as LogoType });
      const svg = container.querySelector('svg');

      expect(svg).not.toBeNull();
      expect(svg).toHaveClass('tc__logo');
      expect(svg).toHaveClass(`tc__logo-${type}`);
      expect(svg).toMatchSnapshot();
    });

    it(`renders a small logo with type ${type}`, () => {
      const { container } = subject({ ...defaultProps, size: 'small', type: type as LogoType });
      const svg = container.querySelector('svg');

      expect(svg).not.toBeNull();
      expect(svg).toHaveClass('tc__logo');
      expect(svg).toHaveClass(`tc__logo-${type}`);
      expect(svg).toMatchSnapshot();
    });

    it(`renders a medium logo with type ${type}`, () => {
      const { container } = subject({ ...defaultProps, size: 'medium', type: type as LogoType });
      const svg = container.querySelector('svg');

      expect(svg).not.toBeNull();
      expect(svg).toHaveClass('tc__logo');
      expect(svg).toHaveClass(`tc__logo-${type}`);
      expect(svg).toMatchSnapshot();
    });

    it(`renders a large logo with type ${type}`, () => {
      const { container } = subject({ ...defaultProps, size: 'large', type: type as LogoType });
      const svg = container.querySelector('svg');

      expect(svg).not.toBeNull();
      expect(svg).toHaveClass('tc__logo');
      expect(svg).toHaveClass(`tc__logo-${type}`);
      expect(svg).toMatchSnapshot();
    });
  });

  it('renders a logo with unsupported type', () => {
    const { container } = subject({ ...defaultProps, type: 'UNSUPPORTED' as LogoType });
    const svg = container.querySelector('svg');

    expect(svg).toBeNull();
  });
});
