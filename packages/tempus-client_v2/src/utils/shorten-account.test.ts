import shortenAccount from './shortenAccount';

describe('shortenAccount()', () => {
  test('it returns a shortened account', () => {
    const shortened = shortenAccount('0xAFE0B5E1bF4b9230A53e4A4715074ABf5B45F5da');

    expect(shortened).toBe('0xAFE0...5F5da');
  });
});
