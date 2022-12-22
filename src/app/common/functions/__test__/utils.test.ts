import {
  fromDecimals, hasCorrectDecimals, isNumeric, maximumUint256Value, toDecimals, toExactFixed
} from '../utils';

test('maximumUint256Value value', () => {
  expect(maximumUint256Value).toEqual(
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  );
});

test('isNumeric function', () => {
  expect(isNumeric(0)).toBeTruthy();
  expect(isNumeric(1)).toBeTruthy();
  expect(isNumeric(1.1)).toBeTruthy();
  expect(isNumeric(0.1)).toBeTruthy();
  expect(isNumeric(0.00000001)).toBeTruthy();
  expect(isNumeric(0.5)).toBeTruthy();
  expect(isNumeric(-0.5)).toBeTruthy();
  expect(isNumeric(-333)).toBeTruthy();
  expect(isNumeric('0.5')).toBeTruthy();
  expect(isNumeric('-0.5')).toBeTruthy();
  expect(isNumeric(BigInt('9007199254740991'))).toBeFalsy();
  expect(isNumeric(null)).toBeFalsy();
  expect(isNumeric(false)).toBeFalsy();
  expect(isNumeric(true)).toBeFalsy();
  expect(isNumeric(NaN)).toBeFalsy();
  expect(isNumeric([])).toBeFalsy();
  expect(isNumeric({})).toBeFalsy();
  expect(isNumeric(() => {})).toBeFalsy();
});

test('toExactFixed function', () => {
  // positive numbers with zero float ends
  expect(toExactFixed('1', 2, true)).toEqual('1.00');
  expect(toExactFixed(1, 2, true)).toEqual('1.00');
  expect(toExactFixed('1.000', 2, true)).toEqual('1.00');
  expect(toExactFixed('10.000', 2, true)).toEqual('10.00');
  expect(toExactFixed('1.1', 2, true)).toEqual('1.10');
  expect(toExactFixed('1.12', 2, true)).toEqual('1.12');

  // positive numbers without zero float ends
  expect(toExactFixed('1', 2)).toEqual('1');
  expect(toExactFixed('1.000', 2)).toEqual('1');
  expect(toExactFixed('1.1234', 2)).toEqual('1.12');
  expect(toExactFixed('1.1000', 2)).toEqual('1.1');
  expect(toExactFixed('1.1', 2)).toEqual('1.1');

  //zero
  expect(toExactFixed('0', 2, true)).toEqual('0.00');

  //   negative
  expect(toExactFixed('-1', 2, true)).toEqual('-1.00');
  expect(toExactFixed('-1', 2)).toEqual('-1');
  expect(toExactFixed(-1, 2, true)).toEqual('-1.00');
  expect(toExactFixed('-1.000', 2, true)).toEqual('-1.00');
  expect(toExactFixed('-1.000', 2)).toEqual('-1');
  expect(toExactFixed('-1.1234', 2)).toEqual('-1.12');
  expect(toExactFixed('-1.1000', 2)).toEqual('-1.1');
  expect(toExactFixed('-1.1', 2)).toEqual('-1.1');
  expect(toExactFixed('-1.1', 2, true)).toEqual('-1.10');
  expect(toExactFixed('-1.12', 2, true)).toEqual('-1.12');
});

test('hasCorrectDecimals function', () => {
  expect(hasCorrectDecimals('1', 0)).toBeTruthy();
  expect(hasCorrectDecimals(1, 0)).toBeTruthy();
  expect(hasCorrectDecimals('1.000', 3)).toBeTruthy();
  expect(hasCorrectDecimals('10.000', 3)).toBeTruthy();
  expect(hasCorrectDecimals('1.1', 1)).toBeTruthy();
  expect(hasCorrectDecimals('1.12', 2)).toBeTruthy();
  expect(hasCorrectDecimals('1.1234', 4)).toBeTruthy();

  //zero
  expect(hasCorrectDecimals('0', 0)).toBeTruthy();
});

test('toDecimals function', () => {
  expect(toDecimals(1, 16)).toEqual('10000000000000000');
  expect(toDecimals('1', 16)).toEqual('10000000000000000');
  expect(toDecimals(1.1, 16)).toEqual('11000000000000000');
  expect(toDecimals('1.10', 16)).toEqual('11000000000000000');
  expect(toDecimals('1.234567890123456', 16)).toEqual('12345678901234560');
  expect(toDecimals('1.23456789012345678', 16)).toEqual('12345678901234567');
  expect(toDecimals('10.23456789012345678', 16)).toEqual('102345678901234567');
});

test('fromDecimals function', () => {
  expect(fromDecimals('10000000000000000', 16)).toEqual('1');
  expect(fromDecimals('11000000000000000', 16)).toEqual('1.1');
  expect(fromDecimals('12345678901234560', 16)).toEqual('1.234567890123456');
  expect(fromDecimals('12345678901234567', 16)).toEqual('1.2345678901234567');
  expect(fromDecimals('102345678901234567', 16)).toEqual('10.2345678901234567');
  expect(fromDecimals('1023456', 16)).toEqual('0.0000000001023456');
});

export { };

