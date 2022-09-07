import {} from '../atoms';

import { useRecoilState } from 'recoil';
import { polygonInfo } from '../atoms';
import {
  getTotalAssetSupply,
  getListSupportedTokens,
} from 'app/common/functions/Web3Client';

export const usePolygonInfoAtom = () => {
  const [polygonInfoAtom, setPolygonInfoAtom] = useRecoilState(polygonInfo);

  const fetchTotalAssetSupply = async () => {
    setPolygonInfoAtom(prev => ({
      ...prev,
      isLoading: true,
    }));
    const [usd, eur, eth, btc] = await Promise.all([
      getTotalAssetSupply('usd'),
      getTotalAssetSupply('eur'),
      getTotalAssetSupply('eth'),
      getTotalAssetSupply('btc'),
    ]);

    setPolygonInfoAtom(prev => ({
      ...prev,
      isLoading: false,
      totalAssetSupply: {
        usd: (+usd).toFixed(2),
        eur: (+eur).toFixed(2),
        eth: (+eth).toFixed(2),
        btc: (+btc).toFixed(2),
      },
    }));
  };

  const fetchUserBalanceForAllCoins = async () => {
    setPolygonInfoAtom(prev => ({
      ...prev,
      isLoading: true,
    }));
    const [usd, eur, eth, btc] = await Promise.all([
      getListSupportedTokens('usd'),
      getListSupportedTokens('eur'),
      getListSupportedTokens('eth'),
      getListSupportedTokens('btc'),
    ]);

    setPolygonInfoAtom(prev => ({
      ...prev,
      isLoading: false,
      coins: {
        usd: usd,
        eur: eur,
        eth: eth,
        btc: btc,
      },
    }));
  };

  return {
    polygonInfoAtom,
    setPolygonInfoAtom,
    fetchTotalAssetSupply,
    fetchUserBalanceForAllCoins,
  };
};
