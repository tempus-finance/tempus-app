import { ethers } from 'ethers';
import { ONE_DAI_IN_RAY, ONE_DAI_IN_WAD } from '../constants';
import { wadToDai, rayToDai } from './rayToDai';

describe('wadToDai()', () => {
  test('return a converted value with less precision', () => {
    for (let i = 0; i < 10; i++) {
      const randomNum = ethers.utils.parseUnits((Math.random() * 100000).toString());
      const value = randomNum.mul(ONE_DAI_IN_WAD);

      expect(wadToDai(value)).toEqual(randomNum);
    }
  });
});

describe('rayToDai()', () => {
  test('return a converted value with less precision', () => {
    for (let i = 0; i < 10; i++) {
      const randomNum = ethers.utils.parseUnits((Math.random() * 100000).toString());
      const value = randomNum.mul(ONE_DAI_IN_RAY);

      expect(rayToDai(value)).toEqual(randomNum);
    }
  });
});
