export type TSupportedToken = {
  label?: string;
  address?: string;
  decimals?: number;
  balance?: string;
  allowance?: string;
  sign?: string;
  // To store boost farm deposited amount converted to the supported token value to improve ui and functionality
  boostDepositedAmount?: number;
};

// Used to save allowances
export type TAllowance = {
  fromTokenAddress: string;
  toTokenAddress: string;
  allowance: string;
};

// type for steps for modal ex step 1: Approve, step2: Deposit
export type TPossibleStep = {
  id: number;
  label: string;
};