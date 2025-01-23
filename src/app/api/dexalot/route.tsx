// import { isSupportedChain } from "@/app/lib/chains"
import { type NextRequest } from "next/server"
// import { serialize } from "wagmi"

// https://api.dexalot-test.com/api/rfq/prices?chainid=43113

// interface PriceData {
//     [key: `${string}/${string}`]: {
//         bids: [
//             basePrice: string,
//             quoteAmount: string,
//         ],
//         asks: [
//             basePrice: string,
//             quoteAmount: string,
//         ],
//     }
// }

// interface ResponseDataType {
//     prices: PriceData[],
// }

// const baseUrl = "https://api.dexalot-test.com"
// const path = "/api/rfq/prices?chainid="
// const channel = `&channel=${process.env.DEXALOT_API_CHANNEL || ""}`

// const options = {
//     headers: {
//         "x-apikey": process.env.DEXALOT_API_KEY || "",
//         "accept": "application/json",
//     },
// } as const


export async function GET(
    // request: NextRequest,
) {

    // const searchParams = request.nextUrl.searchParams
    // const chainIdParam = searchParams.get("chainId")
    // const enabledParam = searchParams.get("enabled")

    // const chainId = chainIdParam && isSupportedChain(parseInt(chainIdParam)) ? parseInt(chainIdParam) : undefined
    // const enabled = chainId !== undefined && enabledParam !== null && enabledParam === "true"

    // const url = `${baseUrl}${path}${chainId}${channel}`

    // console.log(`>>> dexalot test chainIdParam: ${serialize(chainIdParam)}`)
    // console.log(`>>> dexalot test chainId: ${serialize(chainId)}`)
    // console.log(`>>> dexalot test enabledParam: ${serialize(enabledParam)}`)
    // console.log(`>>> dexalot test enabled: ${serialize(enabled)}`)
    // console.log(`>>> dexalot test url: ${serialize(url)}`)

    // let responseData: ResponseDataType | undefined = undefined
  
    // if (enabled) {
    //     await fetch(url, options).then((response) => response.json() as Promise<ResponseDataType>).then((data) => {

    //         console.log(`>>> dexalot test data: ${serialize(data)}`)
    //         responseData = data

    //     }).catch((err) => {
    //         console.error(`error fetching prices: ${err}`)
    //     })
    // }

    return Response.json({})
}
