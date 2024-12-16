import { useCallback, useEffect, useState } from "react"
import { Hash, TransactionReceipt } from "viem"
import { useAccount } from "wagmi"

import { useToast } from "@/app/hooks/toast/useToast"
import { Token, TokenBalance } from "@/app/types/tokens"
import { AccountDataContext, addSwapHistoryItem, getAccountBalances, getSwapStatusToastData, sortAccountSwapHistory, updateSwapHistoryItemStatus } from "@/app/lib/account"
import { AccountBalancesContextType, AccountDataContextType, AccountHistoryContextType } from "@/app/types/account"
import { RouteQuote, SwapHistory, SwapHistoryData } from "@/app/types/swaps"
import { getStorageItem, isStorageAvailable } from "@/app/lib/storage"
import { StorageDataKey, StorageType } from "@/app/types/storage"

// todo: add try/catch and error handling
//  - add status returns as with wagmi hooks
// todo: edge case issue when multiple tokens on the same chain have the same symbol
//  - symbol/decimals are the only identifiers returned by getBalance
//  - add check for duplicate symbol tokens on the same chain and query those separately to avoid overwriting
//  - also try case sensitive vs. insensitive, as long app data is accurate then can avoid some cases, eg. aUSD / AUSD on c-chain

export const AccountDataProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const storageType = StorageType.Local
    const storageAvailable = isStorageAvailable(storageType)
    const historyStorageKey = StorageDataKey.History

    const { address: accountAddress } = useAccount()
    const enabled = storageAvailable === true

    const [accountBalanceData, setAccountBalanceData] = useState<Token[]>([])
    const setBalanceData = useCallback((data?: Token[]) => {
        setAccountBalanceData(data ? data : [])
    }, [enabled, accountAddress, setAccountBalanceData])

    const fetchAccountBalanceData = useCallback(() => {
        if (enabled) {
            getAccountBalances({
                accountAddress: accountAddress,
                setData: setBalanceData,
                _enabled: enabled,
            })
        }
    }, [enabled, accountAddress, setBalanceData])

    useEffect(() => {
        fetchAccountBalanceData()
    }, [enabled, accountAddress, fetchAccountBalanceData])

    const getTokenBalance = useCallback((token?: Token) => {
        const result = token ? accountBalanceData.find((data) => data.id === token.id && data.chainId === token.chainId) : undefined
        return {
            balance: result?.balance,
            balanceFormatted: result?.balanceFormatted,
        } as TokenBalance
    }, [accountBalanceData])

    const getTokenBalanceData = useCallback((token?: Token) => {
        return token ? accountBalanceData.find((data) => data.id === token.id && data.chainId === token.chainId) : undefined
    }, [accountBalanceData])

    const balancesContext: AccountBalancesContextType = {
        data: accountBalanceData,
        getTokenBalance: getTokenBalance,
        getTokenBalanceData: getTokenBalanceData,
        refetch: fetchAccountBalanceData,
    }

    const [latestSwapHistory, setLatestSwapHistory] = useState<SwapHistory>()
    const [accountHistoryData, setAccountHistoryData] = useState<SwapHistory[]>([])
    const setAccountHistory = useCallback((data?: SwapHistory[]) => {
        const accountHistory = data ? sortAccountSwapHistory(data) : []
        setAccountHistoryData(accountHistory)
    }, [setAccountHistoryData])

    const getStorageAccountHistoryData = useCallback(() => {
        const data = getStorageItem(historyStorageKey, storageType)
        return data ? (data as SwapHistoryData) : undefined
    }, [historyStorageKey, storageType])

    const getSwapHistory = useCallback((txid?: Hash) => {
        return txid ? accountHistoryData.find((data) => data.id === txid) : undefined
    }, [accountHistoryData])

    const addSwapHistory = useCallback(async (quote?: RouteQuote, txReceipt?: TransactionReceipt) => {
        if (enabled && txReceipt) {
            const storageData = getStorageAccountHistoryData()
            const swapHistory = await addSwapHistoryItem({
                accountAddress: accountAddress,
                storageKey: historyStorageKey,
                storageType: storageType,
                storageData: storageData,
                quote: quote,
                txReceipt: txReceipt,
                setData: setAccountHistory,
                _enabled: enabled,
            })
            if (swapHistory) {
                setLatestSwapHistory(swapHistory)
            }
        }
    }, [enabled, accountAddress, historyStorageKey, storageType, setAccountHistory, getStorageAccountHistoryData, setLatestSwapHistory])

    const updateSwapHistoryStatus = useCallback(async (swapHistory?: SwapHistory) => {
        if (enabled && swapHistory) {
            const storageData = getStorageAccountHistoryData()
            const newHistory = await updateSwapHistoryItemStatus({
                accountAddress: accountAddress,
                storageKey: historyStorageKey,
                storageType: storageType,
                storageData: storageData,
                history: swapHistory,
                setData: setAccountHistory,
                _enabled: enabled,
            })
            if (newHistory && newHistory.status !== swapHistory.status) {
                if (latestSwapHistory && latestSwapHistory.id === newHistory.id) {
                    setLatestSwapHistory(newHistory)
                }
                else {
                    toast(getSwapStatusToastData(newHistory))
                }
            }
        }
    }, [enabled, accountAddress, historyStorageKey, storageType, setAccountHistory, getStorageAccountHistoryData, latestSwapHistory, setLatestSwapHistory])

    const fetchAccountHistoryData = useCallback(() => {
        const data = enabled && accountAddress ? getStorageAccountHistoryData()?.[accountAddress] ?? [] : []
        setAccountHistory(data)
    }, [enabled, accountAddress, setAccountHistory, getStorageAccountHistoryData])

    useEffect(() => {
        fetchAccountHistoryData()
    }, [enabled, accountAddress, fetchAccountHistoryData])

    const { toast } = useToast()
    useEffect(() => {
        if (latestSwapHistory) {
            toast(getSwapStatusToastData(latestSwapHistory))
        }
    }, [latestSwapHistory])

    const historyContext: AccountHistoryContextType = {
        data: accountHistoryData,
        getSwapHistory: getSwapHistory,
        addSwapHistory: addSwapHistory,
        updateSwapHistoryStatus: updateSwapHistoryStatus,
        latestSwapHistory: latestSwapHistory,
        refetch: fetchAccountHistoryData,
    }

    const refetchAccountData = useCallback(() => {
        fetchAccountBalanceData()
        fetchAccountHistoryData()
    }, [fetchAccountBalanceData, fetchAccountHistoryData])

    const context: AccountDataContextType = {
        balances: balancesContext,
        history: historyContext,
        refetch: refetchAccountData,
    }

    return (
        <AccountDataContext.Provider value={context} >
            {children}
        </AccountDataContext.Provider>
    )
}
