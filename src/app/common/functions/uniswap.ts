import { EEthereumAddresses } from "../constants/addresses"

export const getUniswapPoolAddress = (sellTokenAddress: string, buyTokenAddress: string): string => {
    // ALLUO/ETH pool
    if ((sellTokenAddress == EEthereumAddresses.ALLUO || sellTokenAddress == EEthereumAddresses.WETH)
        && (buyTokenAddress == EEthereumAddresses.WETH || buyTokenAddress == EEthereumAddresses.ALLUO)) {
        return EEthereumAddresses.ALLUOETHPOOL;
    }

    // EURT/USDC
    if ((sellTokenAddress == EEthereumAddresses.EURT || sellTokenAddress == EEthereumAddresses.USDC)
        && (buyTokenAddress == EEthereumAddresses.USDC || buyTokenAddress == EEthereumAddresses.EURT)) {
        return EEthereumAddresses.EURTUSDCPOOL;
    }

    if ((sellTokenAddress == EEthereumAddresses.EURT || sellTokenAddress == EEthereumAddresses.USDT)
        && (buyTokenAddress == EEthereumAddresses.USDT || buyTokenAddress == EEthereumAddresses.EURT)) {
        return EEthereumAddresses.EURTUSDTPOOL;
    }

    // USDC/ETH
    if ((sellTokenAddress == EEthereumAddresses.USDC || sellTokenAddress == EEthereumAddresses.WETH)
        && (buyTokenAddress == EEthereumAddresses.WETH || buyTokenAddress == EEthereumAddresses.USDC)) {
        return EEthereumAddresses.USDCETHPOOL;
    }

    // WBTC/USDC
    if ((sellTokenAddress == EEthereumAddresses.WBTC || sellTokenAddress == EEthereumAddresses.USDC)
        && (buyTokenAddress == EEthereumAddresses.USDC || buyTokenAddress == EEthereumAddresses.WBTC)) {
        return EEthereumAddresses.WBTCUSDCPOOL;
    }

    // CRV/USDC
    if ((sellTokenAddress == EEthereumAddresses.CRV || sellTokenAddress == EEthereumAddresses.USDC)
        && (buyTokenAddress == EEthereumAddresses.USDC || buyTokenAddress == EEthereumAddresses.CRV)) {
        return EEthereumAddresses.CRVUSDCPOOL;
    }

    // CVX/USDC
    if ((sellTokenAddress == EEthereumAddresses.CVX || sellTokenAddress == EEthereumAddresses.USDC)
        && (buyTokenAddress == EEthereumAddresses.USDC || buyTokenAddress == EEthereumAddresses.CVX)) {
        return EEthereumAddresses.CVXUSDCPOOL;
    }

    // LDO/USDC
    if ((sellTokenAddress == EEthereumAddresses.LDO || sellTokenAddress == EEthereumAddresses.USDC)
        && (buyTokenAddress == EEthereumAddresses.USDC || buyTokenAddress == EEthereumAddresses.LDO)) {
        return EEthereumAddresses.LDOUSDCPOOL;
    }

    // FXS/USDC
    if ((sellTokenAddress == EEthereumAddresses.FXS || sellTokenAddress == EEthereumAddresses.USDC)
        && (buyTokenAddress == EEthereumAddresses.USDC || buyTokenAddress == EEthereumAddresses.FXS)) {
        return EEthereumAddresses.FXSUSDCPOOL;
    }

    return null;
}