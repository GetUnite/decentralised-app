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
import { getOptimisedFarmInterest } from 'app/common/functions/optimisedFarm';
import apyCodes from "./apyCodes.json";

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
    'Curve/Convex agEUR+EUROC'
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


let omnivaultCodes = [
    "Alluo/Yearn TopOmnivaultUSD",
    "Alluo/Yearn Top3OmnivaultUSD",
    "Alluo/Beefy TopOmnivaultUSD",
    "Alluo/Beefy Top3OmnivaultUSD",
    "Alluo/Yearn TopOmnivaultETH",
    "Alluo/Yearn Top3OmnivaultETH",
    "Alluo/Beefy TopOmnivaultETH",
    "Alluo/Beefy Top3OmnivaultETH"
]

let omnivaultAddresses = [
    "0x306Df6b5D50abeD3f7bCbe7399C4b8e6BD55cB81", "0x2682c8057426FE5c462237eb3bfcfEDFb9539004", "0xAf332f4d7A82854cB4B6345C4c133eC60c4eAd87", "0x75862d2fEdb1c6a9123F3b5d5E36D614570B404d",
    "0x4eC3177F5c2500AAABE56DDbD8907d41d17Fc2E9", "0xDd7ebC54b851E629E61bc49DFcAed41C13fc67Da", "0xA430432eEf5C062D34e4078540b91C2ec7DBe0c9", "0x2EC847395B6247Ab72b7B37432989f4547A0e947"
]
async function getAPYForDirection(name: string): Promise<number> {
    if (name == "Polygon Buffer") {
        return 0
    }
    if (name.startsWith("Null")) {
        return 0;
    }

    let llamaCode = apyCodes.find((x) => x.name == name)?.code
    if (llamaCode == undefined) {
        throw Error("No llama code found for " + name)
    }
    let apy = await getAPY(llamaCode)
    return Number(apy);
}


async function getAPY(llamaAPICode: string): Promise<string> {
    let estimatedFactorAbove = 0;
    if (llamaAPICode.split("-")[0] == "YEARN" || llamaAPICode.split("-")[0] == "BEEFY") {
        let apy = await getOptimisedFarmInterest(llamaAPICode.split("-")[1], llamaAPICode.split("-")[0].toLowerCase());
        return apy
    }

    else if (llamaAPICode.length > 36) {
        // Estimated margin from FraxConvex yield above convexfinance yields
        let splitted = llamaAPICode.split("-")
        estimatedFactorAbove = Number(splitted[splitted.length - 1]);
        llamaAPICode = llamaAPICode.slice(0, -5)
    }

    let requestURL = "https://yields.llama.fi/chart/" + llamaAPICode;
    try {
        const response = await fetch(requestURL);
        const data = await response.json();
        let latestData = data.data[data.data.length - 1];
        let latestAPY = latestData["apy"] + estimatedFactorAbove;
        return latestAPY;
    } catch (error) {
        console.error(error);
        return String(error);
    }
}


async function getTotalLiquidityDirectionValue(assetId: number, chainId: number): Promise<any[]> {
    let activeDirectionsForAsset = await callContract(IAlluoStrategyHandlder, "0xca3708d709f1324d21ad2c0fb551cc4a0882fd29", "getActiveDirectionsForAssetId(uint256)", [assetId], chainId);
    let returnType = [];
    for (let i = 0; i < activeDirectionsForAsset.length; i++) {
        let value = await callContract(IAlluoStrategyHandlder, "0xca3708d709f1324d21ad2c0fb551cc4a0882fd29", "markDirectionToMarket(uint256)", [Number(activeDirectionsForAsset[i])], chainId);
        let name = await callContract(IAlluoStrategyHandlder, "0xca3708d709f1324d21ad2c0fb551cc4a0882fd29", "directionIdToName(uint256)", [Number(activeDirectionsForAsset[i])], chainId);
        value = Number(ethers.utils.formatUnits(value, 18))
        let apy = await getAPYForDirection(name)
        returnType.push({ name: name, value: value, apy: apy })
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
            let apy = await getAPYForDirection(name)
            returnType.push({ name: name, value: value, apy: apy })
        } catch (error) {
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

