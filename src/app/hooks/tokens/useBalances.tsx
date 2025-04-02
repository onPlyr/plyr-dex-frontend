import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Address, erc20Abi, formatUnits } from "viem"
import { useAccount } from "wagmi"
import { getBalance as wagmiGetBalance, readContracts } from "@wagmi/core"

import { wagmiConfig } from "@/app/config/wagmi"
import { getParsedError } from "@/app/lib/utils"
import { getErc20Tokens, getInitialTokenAmountDataMap, getNativeTokens } from "@/app/lib/tokens"
import { ChainId } from "@/app/types/chains"
import { GetTokenBalanceFunction, isNativeToken, Token, TokenAmountDataMap } from "@/app/types/tokens"

export interface UseBalancesReturnType {
    balances: TokenAmountDataMap,
    getBalance: GetTokenBalanceFunction,
    isPending: boolean,
    isFetching: boolean,
    isInProgress: boolean,
    error?: string,
    refetch: () => void,
}

interface TokenBalanceQuery {
    chainId: ChainId,
    address: Address,
    abi: typeof erc20Abi,
    functionName: "balanceOf",
    args: [Address],
}

interface FetchBalancesParameters {
    tokens: Token[],
    accountAddress?: Address,
    initialData: TokenAmountDataMap,
}

const fetchBalances = async ({
    tokens,
    accountAddress,
    initialData,
}: FetchBalancesParameters) => {

    const balances = new Map(initialData)

    try {

        if (!tokens.length || !accountAddress) {
            return balances
        }

        const nativeQueries = getNativeTokens(tokens).map((token) => wagmiGetBalance(wagmiConfig, {
            chainId: token.chainId,
            address: accountAddress,
        }))
        const erc20Queries: TokenBalanceQuery[] = getErc20Tokens(tokens).map((token) => ({
            chainId: token.chainId,
            address: token.address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [accountAddress],
        }))

        const nativeResults = await Promise.allSettled(nativeQueries).then((results) => results.map((data) => data.status === "fulfilled" ? data.value.value : undefined))
        const erc20Results = await readContracts(wagmiConfig, {
            contracts: erc20Queries,
        }).then((results) => results.map((data) => data.result))

        let nativeIndex = 0
        let tokenIndex = 0

        for (const token of tokens) {

            let balance: bigint | undefined = undefined

            if (isNativeToken(token)) {
                balance = nativeResults[nativeIndex]
                nativeIndex++
            }

            else {
                balance = erc20Results[tokenIndex]
                tokenIndex++
            }

            balances.set(token.uid, {
                amount: balance,
                formatted: balance !== undefined ? formatUnits(balance, token.decimals) : undefined,
            })
        }

        return balances
    }

    catch (err) {
        throw new Error(getParsedError(err))
    }
}

export const useBalances = (tokens: Token[]): UseBalancesReturnType => {

    const { address: accountAddress } = useAccount()
    const initialBalances = useMemo(() => getInitialTokenAmountDataMap(tokens), [tokens])

    const { data, isPending, isFetching, error, refetch } = useQuery({
        queryKey: ["balances", tokens, accountAddress],
        queryFn: async () => fetchBalances({
            tokens: tokens,
            accountAddress: accountAddress,
            initialData: initialBalances,
        }),
        // placeholderData: initialBalances,
    })

    const balances = useMemo(() => data ?? initialBalances, [initialBalances, data])
    const errorMsg = useMemo(() => error ? getParsedError(error) : undefined, [error])
    const getBalance = useCallback((token?: Token) => token && balances.get(token.uid), [balances])

    return {
        balances: balances,
        getBalance: getBalance,
        isPending: isPending,
        isFetching: isFetching,
        isInProgress: isFetching,
        error: errorMsg,
        refetch: refetch,
    }
}

export default useBalances
