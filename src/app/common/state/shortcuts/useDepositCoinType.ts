import { useRecoilState } from 'recoil';
import { farmDepositCoinType } from '../atoms';

export const useDepositCoinType = () => {
  const [farmDepositCoinTypeAtom, setFarmDepositCoinTypeAtom] = useRecoilState(
    farmDepositCoinType,
  );
  const coinIcon =
    farmDepositCoinTypeAtom === 'usd'
      ? '$'
      : farmDepositCoinTypeAtom === 'eur'
      ? '€'
      : farmDepositCoinTypeAtom === 'eth'
      ? 'Ξ'
      : farmDepositCoinTypeAtom === 'btc'
      ? '₿'
      : '';

  return { coinIcon, farmDepositCoinTypeAtom, setFarmDepositCoinTypeAtom };
};
