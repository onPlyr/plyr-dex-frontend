import { useCallback, useEffect, useState } from "react"
import { erc20Abi, formatUnits } from "viem"
import { useAccount, useReadContracts } from "wagmi"
import { getBalance } from "@wagmi/core"

import { wagmiConfig } from "@/app/config/wagmi"
import { getTokens, sortTokens } from "@/app/lib/tokens"
import { getParsedError } from "@/app/lib/utils"
import { Token } from "@/app/types/tokens"

const formatTokenData = (token: Token, balance?: bigint) => {
    return {
        ...token,
        balance: balance,
        balanceFormatted: balance !== undefined ? formatUnits(balance, token.decimals) : undefined,
    } as Token
}

const useReadTokensAndBalances = () => {

    const { address: accountAddress } = useAccount()
    const tokens = getTokens({
        ignoreSort: true,
    })
    const nativeTokens = tokens.filter((token) => token.isNative)
    const erc20Tokens = tokens.filter((token) => token.isNative !== true)
    const enabled = accountAddress !== undefined

    const [tokenData, setTokenData] = useState<Token[]>(tokens)
    const [nativeBalanceData, setNativeBalanceData] = useState<(bigint | undefined)[]>()

    const getNativeBalances = useCallback(async () => {

        const results: (bigint | undefined)[] = []

        if (enabled) {
            for (const token of nativeTokens) {
                try {
                    const { value } = await getBalance(wagmiConfig, {
                        chainId: token.chainId,
                        address: accountAddress,
                    })
                    results.push(value)
                }
                catch (err) {
                    console.error(`useReadTokensAndBalances error: ${getParsedError(err)}`)
                    results.push(undefined)
                }
            }
        }

        setNativeBalanceData(enabled ? results : undefined)

    }, [enabled, accountAddress])

    useEffect(() => {
        getNativeBalances()
    }, [enabled, accountAddress])

    const erc20BalanceContracts = enabled ? erc20Tokens.map((token) => {
        return {
            chainId: token.chainId,
            address: token.address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [accountAddress],
            query: {
                enabled: enabled,
            },
        } as const
    }) : []

    const { data: erc20BalanceData, refetch: refetchErc20Balances } = useReadContracts({
        contracts: erc20BalanceContracts,
        query: {
            enabled: enabled,
        },
    })

    useEffect(() => {

        const balanceCheck = enabled && nativeBalanceData !== undefined && nativeBalanceData.length > 0 && erc20BalanceData !== undefined && erc20BalanceData.length > 0
        const nativeData = balanceCheck ? nativeBalanceData.map((balance, i) => formatTokenData(nativeTokens[i], balance)) : undefined
        const erc20Data = balanceCheck ? erc20BalanceData.map((data, i) => formatTokenData(erc20Tokens[i], data.result)) : undefined

        const tokenData = nativeData && nativeData.length > 0 && erc20Data && erc20Data.length > 0 ? [nativeData, erc20Data].flat() : tokens
        setTokenData(sortTokens(tokenData))

    }, [enabled, accountAddress, nativeBalanceData, erc20BalanceData])

    const refetch = useCallback(() => {
        getNativeBalances()
        refetchErc20Balances()
    }, [getNativeBalances, refetchErc20Balances])

    return {
        data: tokenData,
        refetch: refetch,
    }
}

export default useReadTokensAndBalances
