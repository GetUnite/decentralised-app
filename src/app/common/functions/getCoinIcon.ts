export const getCoinIcon = (type = 'usd') => {
  const coinIcon =
    type === 'usd'
      ? '$'
      : type === 'eur'
      ? '€'
      : type === 'eth'
      ? 'Ξ'
      : type === 'btc'
      ? '₿'
      : '';

  return coinIcon;
};
