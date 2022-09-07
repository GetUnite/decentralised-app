import { AssetCard } from '../components';

import { EChain } from 'app/common/functions/Web3Client';

export const Assets = ({ availableFarms, isLoading }) => {
  return (
    <>
      {Array.isArray(availableFarms) &&
        availableFarms.map(farmCoin => {
          return (
            <AssetCard
              id={farmCoin.id}
              key={farmCoin.id}
              type={farmCoin.type}
              name={farmCoin.name}
              totalAssetSupply={farmCoin.totalAssetSupply}
              interest={farmCoin.interest}
              disabled={false}
              sign={farmCoin.sign}
              icons={farmCoin.icons}
              isLoading={isLoading}
              chain={farmCoin.chain as EChain}
              isBooster={farmCoin.isBooster}
            />
          );
        })}
    </>
  );
};
