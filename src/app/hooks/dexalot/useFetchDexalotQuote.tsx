import useSWR from "swr" 

import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"
import { serialize } from "wagmi"

// https://api.dexalot-test.com/api/rfq/prices?chainid=43113

// const baseUrl = "https://api.dexalot-test.com"
// const apiPath = "/api/rfq/prices?chainid="

// const apiOptions = {
//     headers: {
//         "x-apikey": process.env.DEXALOT_API_KEY || "",
//         "accept": "application/json",
//     },
// } as const

// const fetcher = async (url?: string) => {
//     return url && enabled ? fetch(`${baseUrl}${url}`).then(res => res.json()) : undefined
// }

const fetcher = (url: string) => fetch(url).then(r => r.json())

const useFetchDexalotQuote = ({
    srcChain,
    srcToken,
    srcAmount,
    dstChain,
    dstToken,
    _enabled = true,
}: {
    srcChain?: Chain,
    srcToken?: Token,
    srcAmount: bigint,
    dstChain?: Chain,
    dstToken?: Token,
    _enabled?: boolean,
}) => {

    const enabled = _enabled !== false && srcChain !== undefined && srcToken !== undefined && srcAmount !== undefined && srcAmount > 0 && dstChain !== undefined && dstToken !== undefined && srcChain.id === 43113


    const { data, error, isLoading } = useSWR(`/api/dexalot/?chainId=${srcChain ? srcChain.id : ""}&enabled=${enabled}`, fetcher)

    console.log(`>>> useFetchDexalotQuote data: ${serialize(data)}`)
    console.log(`>>> useFetchDexalotQuote error: ${serialize(error)}`)
    console.log(`>>> useFetchDexalotQuote isLoading: ${serialize(isLoading)}`)

    // const [data, setData] = useState()

    // const fetchPrices = useCallback(async (url: string) => {
    //     if (enabled) {
    //         // await fetch(url, apiOptions).then((response) => response.json()).then((response) => (
    //         //     setData(response)
    //         // ))
    //         await fetch(url, apiOptions).then((response) => (
    //             console.log(`>>> useFetchDexalotQuote response: ${serialize(response)}`)
    //         ))
    //     }
    //     else {
    //         setData(undefined)
    //     }
    // }, [enabled, apiOptions])

    // useEffect(() => {
    //     if (enabled && apiUrl) {
    //         fetchPrices(apiUrl)
    //     }
    // }, [enabled, srcChain, srcToken, srcAmount, dstChain, dstToken, apiUrl])

    // console.log(`>>> useFetchDexalotQuote data: ${serialize(data)}`)

    return {
        data: data,
    }
}

export default useFetchDexalotQuote
