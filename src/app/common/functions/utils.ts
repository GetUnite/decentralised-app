import { ethers } from 'ethers';
import fromExponential from 'from-exponential';

export const maximumUint256Value =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

export const isNumeric = (num: any) =>
  (typeof num === 'number' || (typeof num === 'string' && num.trim() !== '')) &&
  !isNaN(num as number);

export const generateRandomInteger = (min, max) => {
  return Math.floor(min + Math.random() * (max + 1 - min));
};

const repeatStringNumTimes = (string: string, times: string | number) => {
  const timesInNum = +times;
  if (timesInNum < 0) return '';
  if (timesInNum === 1) return string;
  else return string + repeatStringNumTimes(string, timesInNum - 1);
};

export const toDecimals = (amount, decimals) => {
  const amountNonExponential = fromExponential(amount);
  const dotIndex = amountNonExponential.indexOf('.');
  let amountInDecimals =
    dotIndex > -1
      ? amountNonExponential
          .substring(0, dotIndex + +decimals + 1)
          .replace(/\./, '')
      : amountNonExponential;
  if (dotIndex > -1) {
    const amountDecimalCount = amountNonExponential.length - 1 - dotIndex;
    const differenceOfDecimals = decimals - amountDecimalCount;
    if (differenceOfDecimals > 0) {
      amountInDecimals += repeatStringNumTimes(
        '0',
        decimals - (amountNonExponential.length - dotIndex - 1),
      );
    }
  } else {
    amountInDecimals += repeatStringNumTimes('0', decimals);
  }
  return amountInDecimals;
};

export const fromDecimals = (
  amount: string | number,
  decimals,
  isFixed = false,
): string => {
  amount = amount.toString();
  let newAmount = '';

  if (amount.length <= decimals) {
    newAmount +=
      repeatStringNumTimes('0', 1 + +decimals - amount.length) + amount;
  } else newAmount = amount;

  newAmount =
    newAmount.substring(0, newAmount.length - decimals) +
    '.' +
    newAmount.substring(newAmount.length - decimals);

  if (newAmount.indexOf('.') > -1) {
    newAmount = newAmount.replace(/^00/, '0');

    newAmount = replaceRecursively(/0$/, newAmount, '');
    newAmount = newAmount.replace(/\.$/, '');
  }

  return newAmount;

  // 6 decimal test cases
  // 123456 => 0.123456
  // 3456 => 0.003456
  // 9123456 => 9.123456
  // 9000000 => 9
  // 123456 => 0.123456
};
const thousandsSeparator = Number(10000).toLocaleString().charAt(2);
const decimalSeparator = Number(1.1).toLocaleString().charAt(1);

export const roundDown = (number, decimals) => {
  decimals = decimals || 0;
  return ( Math.floor( number * Math.pow(10, decimals) ) / Math.pow(10, decimals) );
}

export const toExactFixed = (
  number: number | string,
  decimals: number,
  withZeroEnds = false,
): string => {
  const roundedDownNumber = roundDown(+number, decimals);

  return withZeroEnds
    ? roundedDownNumber.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
      })
    : roundedDownNumber.toLocaleString(undefined, {
        maximumFractionDigits: decimals,
      });
};

const replaceRecursively = (pattern, oldString, newString) => {
  if (!pattern.test(oldString)) return oldString;
  const generatedString = oldString.replace(pattern, newString);
  return replaceRecursively(pattern, generatedString, newString);
};

export const hasCorrectDecimals = (
  number: number | string,
  decimals: number,
): boolean => {
  return fromExponential(number) === toExactFixed(number, decimals, true);
};

export const addressIsValid = address => {
  return ethers.utils.isAddress(address);
};

export const timerIsFinished = expectedTime => {
  return +expectedTime === 0 || +expectedTime * 1000 <= Date.now();
};

export const getNextMonday = (date = new Date()) => {
  const dateCopy = new Date(date.getTime());

  const nextMonday = new Date(
    dateCopy.setDate(
      dateCopy.getDate() + ((7 - dateCopy.getDay() + 1) % 7 || 7),
    ),
  );

  return nextMonday;
};

export const depositDivided = depositedAmount => {
  depositedAmount = depositedAmount.toString();
  const dotIndex = depositedAmount.indexOf('.');
  const balanceFirstPart = depositedAmount.substring(0, dotIndex + 3);
  const balanceSecondPart = depositedAmount.substring(
    dotIndex + 3,
    dotIndex + 9,
  );
  return { first: balanceFirstPart, second: balanceSecondPart };
};

export const shuffleArray = array => {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = temp;
  }

  return newArray;
};

export const fromLocaleString = string => {
  const formattedString = string
    .replace(thousandsSeparator, '')
    .replace(decimalSeparator, '.');
  return +formattedString;
};
