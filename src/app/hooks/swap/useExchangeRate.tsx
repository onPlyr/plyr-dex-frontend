import { useEffect, useState } from "react"
import { parseUnits } from "viem"

import { Token } from "@/app/types/tokens"

const useExchangeRate = ({
    srcToken,
    srcAmount,
    dstToken,
    dstAmount,
}: {
    srcToken?: Token,
    srcAmount?: bigint,
    dstToken?: Token,
    dstAmount?: bigint,
}) => {

    const [exchangeRate, setExchangeRate] = useState<bigint>()

    useEffect(() => {
        setExchangeRate(srcToken && srcAmount && dstToken && dstAmount ? (dstAmount * parseUnits("1", srcToken.decimals)) / srcAmount : undefined)
    }, [srcToken, srcAmount, dstToken, dstAmount])

    return exchangeRate
}

export default useExchangeRate
