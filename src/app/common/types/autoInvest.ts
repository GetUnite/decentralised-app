import { TPossibleStep, TSupportedToken } from './global';

export type TStreamOptionCreationSteps = {
  fromTokenAddress: string;
  toTokenAddress: string;
  steps: TPossibleStep[];
};

export type TStreamOption = {
  fromLabel: string;
  toLabel: string;
  fromSign: string;
  fromAddress?: string;
  fromIbAlluoAddress: string;
  fromStIbAlluoAddress: string;
  toIbAlluoAddress: string;
  toStIbAlluoAddress: string;
  ricochetMarketAddress: string;
  underlyingTokenAddress: string;
  // force certain icons even tho label is generic
  toIcon?: string;
  fromIcon?:string;
};

export type TSupportedStreamToken = TSupportedToken & {
  // Is immediatly streamable for auto invest
  isStreamable?: boolean;
  canStreamTo?: TSupportedToken[];
};
