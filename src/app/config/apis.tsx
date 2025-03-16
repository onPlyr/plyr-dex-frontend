import { avalancheFuji } from "viem/chains"

import { ApiProvider, ApiProviderDataType, ApiRoute, ApiRouteType } from "@/app/types/apis"

export const ApiProviderData: Record<ApiProvider, ApiProviderDataType> = {
    [ApiProvider.Dexalot]: {
        baseApiUrl: "https://api.dexalot-test.com",
        apiFetchOptions: {
            headers: {
                "x-apikey": process.env.DEXALOT_API_KEY || "",
                "accept": "application/json",
                "content-type": "application/json",
            },
        },
        routes: {
            [ApiRouteType.Api]: {
                [ApiRoute.Pairs]: "/api/rfq/pairs",
                [ApiRoute.SimpleQuote]: "/api/rfq/pairprice",
                [ApiRoute.FirmQuote]: "/api/rfq/firm",
            },
            [ApiRouteType.App]: {
                [ApiRoute.Pairs]: "/api/dexalot/pairs",
                [ApiRoute.SimpleQuote]: "/api/dexalot/quote/simple",
                [ApiRoute.FirmQuote]: "/api/dexalot/quote/firm",
            },
        },
        supportedChains: [
            avalancheFuji.id,
        ],
    },
} as const
