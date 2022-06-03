import { ProtocolName } from '../interfaces';
import { prettifyProtocolName } from './prettifyProtocolName';

describe('prettifyProtocolName', () => {
  it('returns correct value', () => {
    expect(prettifyProtocolName('lido')).toEqual('Lido');
    expect(prettifyProtocolName('rari')).toEqual('Rari Capital');
    expect(prettifyProtocolName('yearn')).toEqual('Yearn');
    expect(prettifyProtocolName('aave')).toEqual('Aave');
    expect(prettifyProtocolName('compound')).toEqual('Compound');
  });

  it('throws error if protocol not exist', () => {
    try {
      prettifyProtocolName('abc' as ProtocolName);
    } catch (e) {
      expect(e).toEqual(new Error('prettifyProtocolName() - Failed to prettify protocol name!'));
    }
  });
});
