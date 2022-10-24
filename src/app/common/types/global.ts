export type TSupportedToken = {
  label?: string;
  address?: string;
  decimals?: number;
  balance?: string;
  allowance?: string;
  sign?: string;
  // To store boost farm deposited amount converted to the supported token value to improve ui and functionality
  boosterDepositedAmount?: number;
};

// Represents every token used on the system
export type TToken = {
  label?: string;
  address?: string;
  decimals?: number;
  sign?: string;
}

export type TTokenInfo = TToken & {
  balance?: string;
  allowance?: number;
}