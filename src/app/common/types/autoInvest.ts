import { TSupportedToken } from './global';

export type TStreamCreationStep = {
  id: number;
  label: string;
};

export type TStreamOptionCreationSteps = {
  fromTokenAddress: string;
  toTokenAddress: string;
  steps: TStreamCreationStep[];
};

export type TStreamTokensCombination = {
  fromAddress: string;
  fromStIbAlluoAddress: string;
  toIbAlluoAddress: string;
  toStIbAlluoAddress: string;
  ricochetMarketAddress: string;
};

export type TSupportedStreamToken = TSupportedToken & {
  // Is immediatly streamable for auto invest
  isStreamable?: boolean;
  canStreamTo: TSupportedToken[];
};
