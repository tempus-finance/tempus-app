import getCookie from './getCookie';

describe('getCookie', () => {
  // document cookie is not a simple string - it's actually a Cookie object with setter and getter
  // ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
  document.cookie = '_ga=GA1.1.749009752.1642679418';
  document.cookie = '_ga_2SSGMHY3NP=GS1.1.1642679417.1.1.1642679440.0';
  document.cookie = 'test=%20%20%20';

  test('should return "GA1.1.749009752.1642679418" for getCookie("_ga")', () => {
    expect(getCookie('_ga')).toEqual('GA1.1.749009752.1642679418');
  });

  test('should return "GS1.1.1642679417.1.1.1642679440.0" for getCookie("_ga_2SSGMHY3NP")', () => {
    expect(getCookie('_ga_2SSGMHY3NP')).toEqual('GS1.1.1642679417.1.1.1642679440.0');
  });

  test('should return "   " for getCookie("test")', () => {
    expect(getCookie('test')).toEqual('   ');
  });

  test('should return "" for getCookie("NON_EXIST")', () => {
    expect(getCookie('NON_EXIST')).toEqual('');
  });
});
