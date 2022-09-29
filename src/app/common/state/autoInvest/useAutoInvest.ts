import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  getInterest,
  getTotalAssetSupply,
  getUserDepositedAmount,
  getSupportedTokensBasicInfo,
  getSupportedTokensAdvancedInfo,
  getBoosterFarmRewards,
  getUserDepositedLPAmount,
  getTotalAssets,
  getSupportedTokensList,
  claimBoosterFarmNonLPRewards,
  claimBoosterFarmLPRewards,
  getBoosterFarmInterest,
} from 'app/common/functions/web3Client';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../useNotification';
import { TSupportedToken } from 'app/common/types/form';

export type TStream = {
  from: string;
  to: string;
}

const streamFromOptions: string[] = [];
const streamToOptions: string[] = [];

export const useAutoInvest = ({ from, to }) => {
  const { setNotificationt } = useNotification();
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);
  const navigate = useNavigate();

  const [selectedStream, setSelectedStream] = useState<TStream>();
  const [selectedFromSupportedToken, setSelectedFromSupportedToken] = useState<TSupportedToken>();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
  }, [walletAccountAtom]);

  const fetchFarmInfo = async farm => {
    let farmInfo;
    farmInfo = {
      interest: await getInterest(farm.type, farm.chain),
      totalAssetSupply: await getTotalAssetSupply(farm.type, farm.chain),
      supportedTokensList: await getSupportedTokensList(farm.type, farm.chain),
      depositedAmount: 0,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmount = await getUserDepositedAmount(
        farm.type,
        farm.chain,
      );
    }

    return farmInfo;
  };

  const fetchBoosterFarmInfo = async farm => {
    let farmInfo;
    farmInfo = {
      interest: await getBoosterFarmInterest(
        farm.farmAddress,
        farm.convexFarmIds,
        farm.chain,
      ),
      totalAssetSupply: await getTotalAssets(farm.farmAddress, farm.chain),
      supportedTokensList: await Promise.all(
        farm.supportedTokensAddresses.map(async supportedtoken => {
          return await getSupportedTokensBasicInfo(supportedtoken, farm.chain);
        }),
      ),
      depositedAmount: 0,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmount = await getUserDepositedLPAmount(
        farm.farmAddress,
        farm.chain,
      );
      farmInfo.rewards = {
        ...farm.rewards,
        ...(await getBoosterFarmRewards(
          farm.farmAddress,
          farm.rewards.curvePoolAddress,
          farm.chain,
        )),
      };
    }

    return farmInfo;
  };

  const selectFromSupportedToken = fromSupportedToken => {
    setSelectedFromSupportedToken(fromSupportedToken);
  };

  return {
    isLoading,
    selectFromSupportedToken,
  };
};
