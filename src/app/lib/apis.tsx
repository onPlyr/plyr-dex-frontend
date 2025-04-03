import { Address, isAddress } from "viem"

import { ApiProviderData } from "@/app/config/apis"
import { SupportedChains } from "@/app/config/chains"
import { Tokens } from "@/app/config/tokens"
import { isEqualAddress, getBaseUrl } from "@/app/lib/utils"
import { ApiProvider, ApiRoute, ApiRouteType, ApiTokenPairName, BaseApiData } from "@/app/types/apis"

export const getApiParamsData = ({
    provider,
    searchParams,
}: {
    provider: ApiProvider,
    searchParams?: URLSearchParams,
}) => {

    const data: BaseApiData = {
        _enabled: false,
    }

    if (!searchParams) {
        return data
    }

    const enabled = searchParams.get("enabled") !== "false"
    if (!enabled) {
        return data
    }

    const chainId = searchParams.get("chain")
    const chain = chainId ? Object.values(SupportedChains).find((supportedChain) => parseInt(chainId) === supportedChain.id && !supportedChain.isDisabled) : undefined
    if (!chain || !ApiProviderData[provider].supportedChains.some((id) => id === chain.id)) {
        return data
    }

    const cellAddress = searchParams.get("cell")
    const accountAddressString = searchParams.get("account")
    const srcTokenId = searchParams.get("srcToken")
    const srcAmountString = searchParams.get("srcAmount")
    const dstTokenId = searchParams.get("dstToken")
    const slippageString = searchParams.get("slippage")
    const pairString = searchParams.get("pair")
    const isBaseString = searchParams.get("isBase")

    const cell = cellAddress && isAddress(cellAddress) ? chain.cells.find((cell) => isEqualAddress(cell.address, cellAddress)) : undefined
    const accountAddress = accountAddressString && isAddress(accountAddressString) ? accountAddressString as Address : undefined

    if ((cellAddress && !cell) || (accountAddressString && !accountAddress)) {
        return data
    }

    const srcToken = srcTokenId ? Tokens.find((token) => token.id === srcTokenId.toLowerCase() && token.chainId === chain.id) : undefined
    const srcTokenData = provider && srcToken ? srcToken.apiData?.[provider] : undefined
    const dstToken = dstTokenId ? Tokens.find((token) => token.id === dstTokenId.toLowerCase() && token.chainId === chain.id) : undefined
    const dstTokenData = provider && dstToken ? dstToken.apiData?.[provider] : undefined

    if ((srcToken && !srcTokenData) || (dstToken && !dstTokenData)) {
        return data
    }

    const slippage = slippageString ? parseInt(slippageString) : undefined
    const isBase = isBaseString ? isBaseString !== "false" : false
    const pair = pairString && srcTokenData && dstTokenData ? isBase ? `${srcTokenData.id}/${dstTokenData.id}` : `${dstTokenData.id}/${srcTokenData.id}` : undefined

    if ((pair && pairString && pair !== pairString) || (slippageString && slippage === undefined)) {
        return data
    }

    data.chain = chain
    data.cell = cell
    data.accountAddress = accountAddress
    data.srcToken = srcToken
    data.srcTokenData = srcTokenData
    data.srcAmount = srcAmountString ? BigInt(srcAmountString) : undefined
    data.dstToken = dstToken
    data.dstTokenData = dstTokenData
    data.slippage = slippage
    data.pair = pair ? pair as ApiTokenPairName : undefined
    data.isBase = isBase
    data._enabled = enabled

    return data
}

export const getApiUrl = ({
    provider,
    route,
    type,
    params,
}: {
    provider: ApiProvider,
    route: ApiRoute,
    type: ApiRouteType,
    params?: object,
}) => {

    const routePath = ApiProviderData[provider].routes[type]?.[route]
    if (!routePath) {
        return
    }

    return new URL(`${routePath}?${params ? new URLSearchParams([...Object.entries(params)]).toString() : ""}`, type === ApiRouteType.Api ? ApiProviderData[provider].baseApiUrl : getBaseUrl())
}
