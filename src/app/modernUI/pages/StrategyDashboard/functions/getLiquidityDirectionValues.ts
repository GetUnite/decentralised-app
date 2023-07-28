import { EChain } from 'app/common/constants/chains';
import {
    callContract,
    getCurrentWalletAddress,
} from 'app/common/functions/web3Client';
import { ethers } from 'ethers';
import https from "https";

import IERC20Metadata from "./abis/IERC20Metadata.json"
import IIbAlluo from "./abis/IIbAlluo.json"
import ILiquidityHandler from "./abis/ILiquidityHandler.json"
import IAlluoStrategyHandlder from "./abis/IAlluoStrategyHandler.json"
import IStrategyHandler from "./abis/IStrategyHandler.json"
import IAlluoStrategy from "./abis/IAlluoStrategy.json"


const curves: string[] = [
    '', // Placeholder for zero index
    'Curve/Convex Mim+3CRV',
    'Curve/Convex Musd+3CRV',
    'Curve/Convex cEUR+agEUR+EUROC',
    'Curve/Convex stETH+ETH',
    'Curve/Convex alETH+ETH',
    'Curve/Convex hBTC+WBTC',
    'Curve/Convex renBTC+WBTC+sBTC',
    'Curve/Convex agEUR+EURT+EURS',
    'Curve/Convex Frax+USDC',
    'Curve/FraxConvex Frax+USDC',
    'Curve/FraxConvex ETH+frxETH',
    'Curve/Convex ETH+pETH',
    'Curve/Convex multiBTC',
    'Curve/Convex agEUR+EURT'
];

// const USDStrategies = [1, 2, 9, 10]
// const EURStrategies = [3, 8, 14]
// const WETHStrategies = [4, 5, 11, 12]
// const BTCStrategies = [6, 7, 13]
const relevantStrategies = [
    [1, 2, 9, 10], [3, 8, 14], [4, 5, 11, 12], [6, 7, 13]
]

function getStrategyNameById(id: number): string | undefined {
    return curves[id];
}


async function getTotalLiquidityDirectionValue(assetId: number, chainId: number): Promise<any[]> {
    let activeDirectionsForAsset = await callContract(IAlluoStrategyHandlder, "0xca3708d709f1324d21ad2c0fb551cc4a0882fd29", "getActiveDirectionsForAssetId(uint256)", [assetId], chainId);
    let returnType = [];
    for (let i = 0; i < activeDirectionsForAsset.length; i++) {
        let value = await callContract(IAlluoStrategyHandlder, "0xca3708d709f1324d21ad2c0fb551cc4a0882fd29", "markDirectionToMarket(uint256)", [Number(activeDirectionsForAsset[i])], chainId);
        let name = await callContract(IAlluoStrategyHandlder, "0xca3708d709f1324d21ad2c0fb551cc4a0882fd29", "directionIdToName(uint256)", [Number(activeDirectionsForAsset[i])], chainId);
        value = Number(ethers.utils.formatUnits(value, 18))
        returnType.push({ name: name, value: value })
    }
    return returnType;
}

export async function getLegacyLiquidityDirectionValue(assetId: number): Promise<any[]> {
    let relevantActiveStrategyIds = await callContract(IStrategyHandler, "0x385AB598E7DBF09951ba097741d2Fa573bDe94A5", "getAssetActiveIds(uint256)", [assetId], EChain.ETHEREUM);
    let returnType = [];
    for (let i = 0; i < relevantActiveStrategyIds.length; i++) {
        // Get the strategy data first
        try {
            let strategyData = await callContract(IStrategyHandler, "0x385AB598E7DBF09951ba097741d2Fa573bDe94A5", "liquidityDirection(uint256)", [Number(relevantActiveStrategyIds[i])], EChain.ETHEREUM);
            let strategyAddress = strategyData.strategyAddress;
            let strategyRewardsData = strategyData.rewardsData;
            let value = await callContract(IAlluoStrategy, strategyAddress, "getDeployedAmount(bytes)", [strategyRewardsData], EChain.ETHEREUM);
            let name = getStrategyNameById(Number(relevantActiveStrategyIds[i]));

            value = Number(ethers.utils.formatUnits(value, 18))
            returnType.push({ name: name, value: value })
        } catch {
            console.log("Failed to fetch for direction, most likely because of it being deprecated", Number(relevantActiveStrategyIds[i]))
        }

    }

    return returnType;
}

export async function getAllLiquidityDirectionInformation(assetId: number): Promise<any[]> {
    let activeChains = [EChain.OPTIMISM, EChain.POLYGON];
    let returnType = [];
    for (let i = 0; i < activeChains.length; i++) {
        let chainInfo = await getTotalLiquidityDirectionValue(assetId, activeChains[i])
        returnType = returnType.concat(chainInfo)
    }
    return returnType;
}

export async function getBufferAmountForAssetPolygon(assetId: number): Promise<number> {
    let ibAlluosPolygon = [
        "0xC2DbaAEA2EfA47EBda3E572aa0e55B742E408BF6", // usd
        "0xc9d8556645853C465D1D5e7d2c81A0031F0B8a92", // eur
        "0xc677B0918a96ad258A68785C2a3955428DeA7e50", // eth
        "0xf272Ff86c86529504f0d074b210e95fc4cFCDce2", // btc
    ]
    let listSupportedTokens = await callContract(IIbAlluo, ibAlluosPolygon[assetId], "getListSupportedTokens()", [], EChain.POLYGON)
    let primaryToken = listSupportedTokens[0]
    let tokenDecimals = await getTokenDecimals(primaryToken, EChain.POLYGON);
    let balance = 0;

    try {
        balance = Number(ethers.utils.formatUnits(await callContract(ILiquidityHandler, "0x31a3439Ac7E6Ea7e0C0E4b846F45700c6354f8c1", "getAdapterAmount(address)", [ibAlluosPolygon[assetId]], EChain.POLYGON)));
        balance += Number(ethers.utils.formatUnits(await callContract(IERC20Metadata, primaryToken, "balanceOf(address)", ["0x466b375cE0D1161aEb3e69f92B2B9c365f7877BE"], EChain.POLYGON), tokenDecimals));

    } catch { }
    return balance;
}




async function getTokenDecimals(tokenAddress: string, chainId: number): Promise<number> {
    if (tokenAddress == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        return 18;
    }
    let decimals = await callContract(IERC20Metadata, tokenAddress, 'decimals()', [], chainId);
    return decimals
}

