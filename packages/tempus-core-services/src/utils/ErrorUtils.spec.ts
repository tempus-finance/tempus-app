import { TransactionError } from '../interfaces';
import { ErrorUtils } from './ErrorUtils';

describe('ErrorUtils', () => {
  describe('getTransactionErrorCode()', () => {
    [
      { error: { data: { code: 3, message: 'reverted execution: BAL#500' } }, expected: 'BAL#500' },
      { error: { data: { code: 3, message: 'reverted execution: BAL#501' } }, expected: 'BAL#501' },
      { error: { data: { code: 3, message: 'reverted execution: BAL#502' } }, expected: 'BAL#502' },
      { error: { data: { code: 3, message: 'reverted execution: BAL#503' } }, expected: 'BAL#503' },
      { error: { data: { code: 3, message: 'reverted execution: BAL#504' } }, expected: 'BAL#504' },
      { error: { data: { code: 3, message: 'reverted execution: BAL#505' } }, expected: 'BAL#505' },
      { error: { data: { code: 3, message: 'reverted execution: BAL#506' } }, expected: 'BAL#506' },
      { error: { data: { code: 3, message: 'reverted execution: BAL#507' } }, expected: 'BAL#507' },
      { error: { data: { code: 3, message: 'reverted execution: BAL#508' } }, expected: 'BAL#508' },
      { error: { data: { code: 3, message: 'reverted execution: BAL#509' } }, expected: 'BAL#509' },
      { error: { data: { code: 3, message: 'reverted execution: BAL#510' } }, expected: 'BAL#510' },
    ].forEach(({ error, expected }) => {
      test(`should parse the transaction error as ${expected}`, () => {
        expect(ErrorUtils.getTransactionErrorCode(error as TransactionError)).toEqual(expected);
      });
    });
  });
});
