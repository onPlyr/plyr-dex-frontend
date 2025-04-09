import { NextRequest } from "next/server"
import { Address, Hex } from "viem"
import { serialize } from "wagmi"

import { ApiProviderData } from "@/app/config/apis"
import { getApiParamsData, getApiUrl } from "@/app/lib/apis"
import { ApiFirmQuoteResultData, ApiProvider, ApiResult, ApiRoute, ApiRouteType } from "@/app/types/apis"
import { ChainId } from "@/app/types/chains"
import { CellTrade, CellTradeParameter } from "@/app/types/cells"
import { getEncodedCellTrade } from "@/app/lib/cells"

const channel = process.env.DEXALOT_API_CHANNEL || ""
const provider = ApiProvider.Dexalot
const route = ApiRoute.FirmQuote
const providerData = ApiProviderData[provider]

interface FirmQuoteResponseData {
    order: {
        nonceAndMeta: Hex,
        expiry: number,
        makerAsset: Address,
        takerAsset: Address,
        maker: Address,
        taker: Address,
        makerAmount: string,
        takerAmount: string,
    },
    signature: Hex,
    tx: {
        to: Address,
        data: Hex,
        gasLimit: number,
    },
}

/**
* @notice parameters for dexalot firm quote api endpoint
* @dev https://docs.dexalot.com/en/apiv2/SimpleSwap.html#_4-request-firm-quote
* @param chainid
* @param takerAsset The ERC20 address of the asset Taker (The trader) is providing to the trade (source token)
* @param makerAsset The ERC20 address of the asset Maker (Dexalot RFQ Contract) is providing to the trade (destination token)
* @param takerAmount The amount of taker asset for the trade, provided for a sell swap. Should be multiplied by evm_decimals of the taker asset. e.g. for USDC evm_decimals = 6, for a 100 USD trade this number should be 100000000
* @param userAddress The originating user performing the swap (not the executor contract), e.g. trader address: 0x05A1AAC00662ADda4Aa25E1FA658f4256ed881eD
* @param executor The executor contract address which calls the mainnet rfq contract (if not provided userAddress is used as the executor) - in our case this is the cell address
* @param slippage The slippage of the aggregator swap in bps, e.g. '100' for 1%
* @param partner If applicable, a string identifier for the partner executing the swap on your platform - channel id
*/
interface FirmQuoteRequestData {
    chainid: ChainId,
    takerAsset: Address,
    makerAsset: Address,
    takerAmount: string,
    userAddress: Address,
    executor: Address,
    slippage: number,
    partner: string,
}

export const GET = async (request: NextRequest) => {

    const result: ApiResult = {}
    const { chain, cell, accountAddress, srcToken, srcAmount, dstToken, slippage, _enabled } = getApiParamsData({
        provider: provider,
        searchParams: request.nextUrl.searchParams,
    })
    const url = getApiUrl({
        provider: provider,
        route: route,
        type: ApiRouteType.Api,
    })
    const enabled = !(!_enabled || !chain || !cell || !accountAddress || !srcToken || !srcAmount || srcAmount === BigInt(0) || !dstToken || !slippage || !url)

    console.log(`>>> dexalot firm quote enabled: ${serialize(enabled)} / chain: ${serialize(chain?.name)} / cell: ${serialize(cell?.address)} / accountAddress: ${serialize(accountAddress)} / srcToken: ${serialize(srcToken?.symbol)} / srcAmount: ${serialize(srcAmount)} / dstToken: ${serialize(dstToken?.symbol)} / slippage: ${serialize(slippage)} / url: ${serialize(url)}`)

    if (!enabled) {
        return Response.json(result)
    }

    try {

        const params: FirmQuoteRequestData = {
            chainid: chain.id,
            takerAsset: srcToken.address,
            makerAsset: dstToken.address,
            takerAmount: srcAmount.toString(),
            // userAddress: cell.address,
            userAddress: accountAddress,
            executor: cell.address,
            slippage: slippage,
            partner: channel,
        }

        const response = await fetch(url.href, {
            ...providerData.apiFetchOptions,
            method: "POST",
            body: JSON.stringify(params),
        })
        if (!response.ok) {
            const data = await response.json()
            console.log(`>>> dexalot firm quote ERROR data: ${serialize(data)} / params: ${serialize(params)} / response.body: ${serialize(response.body)} / response.text: ${serialize(response.text)} / response.statusText: ${serialize(response.statusText)} / params: ${JSON.stringify(params)}`)
            result.error = `Bad response from endpoint: ${url.href}`
            throw new Error(result.error)
        }

        const data = await response.json() as FirmQuoteResponseData

        if (parseFloat(data.order.makerAmount) === 0) {
            result.msg = "Returned zero amount"
            throw new Error(result.msg)
        }

        const trade: CellTrade = {
            [CellTradeParameter.DexalotOrder]: {
                ...data.order,
                makerAmount: BigInt(data.order.makerAmount),
                takerAmount: BigInt(data.order.takerAmount),
            },
            [CellTradeParameter.Signature]: data.signature,
            [CellTradeParameter.MinAmountOut]: BigInt(data.order.makerAmount),
        }
        const encodedTrade = getEncodedCellTrade(cell, trade)

        console.log(`>>> dexalot firm quote trade: ${serialize(trade)} / encodedTrade: ${serialize(encodedTrade)} / order: ${serialize(data.order)}`)

        if (!encodedTrade) {
            result.msg = "Error encoding trade"
            throw new Error(result.msg)
        }

        const resultData: ApiFirmQuoteResultData = {
            encodedTrade: encodedTrade,
            signature: data.signature,
            amount: data.order.makerAmount,
        }

        result.data = resultData
    }

    catch (err) {
        if (!result.msg) {
            result.isError = true
            if (!result.error) {
                result.error = `Error fetching firm quote: ${err}`
            }
        }
    }

    console.log(`>>> dexalot firm quote result: ${serialize(result)}`)
    return Response.json(result)
}