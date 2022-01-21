import shortenAccount from './shortenAccount';

describe('shortenAccount()', () => {
  test('it returns a shortened account', () => {
    const shortened = shortenAccount('0xAFE0B5E1bF4b9230A53e4A4715074ABf5B45F5da');

    expect(shortened).toBe('0xAFE0...5F5da');
  });

  test('it returns a shortened account for 10 random address', () => {
    const generateAddress = () => {
      const addr1 = Math.random().toString(16).substring(2, 12).toUpperCase();
      const addr2 = Math.random().toString(16).substring(2, 12).toUpperCase();
      const addr3 = Math.random().toString(16).substring(2, 12).toUpperCase();
      const addr4 = Math.random().toString(16).substring(2, 12).toUpperCase();
      return `0x${addr1}${addr2}${addr3}${addr4}`;
    };

    for (let i = 0; i < 10; i++) {
      const address = generateAddress();
      const expected = `${address.substring(0, 6)}...${address.substring(37)}`;

      expect(shortenAccount(address)).toEqual(expected);
    }
  });
});
