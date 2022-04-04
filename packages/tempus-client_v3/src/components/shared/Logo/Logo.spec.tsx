import { render } from '@testing-library/react';
import Logo, { LogoProps, LogoType } from './Logo';

const defaultProps: LogoProps = {
  size: 'medium',
};

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
    'protocol-Aave',
    'protocol-Lido',
    'protocol-Rari',
    'wallet-metamask',
    'wallet-walletconnect',
    'wallet-gnosis',
  ].forEach(type =>
    it(`renders an logo with type ${type}`, () => {
      const { container } = subject({ ...defaultProps, type: type as LogoType });
      const svg = container.querySelector('svg');

      expect(svg).not.toBeNull;
      expect(svg).toHaveClass('tc__logo');
      expect(svg).toHaveClass(`tc__logo-${type}`);
      expect(svg).toMatchSnapshot();
    }),
  );
});
