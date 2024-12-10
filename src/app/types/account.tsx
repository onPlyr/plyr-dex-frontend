import { Hash, TransactionReceipt } from "viem"

import { Token, TokenBalance } from "@/app/types/tokens"
import { RouteQuote, SwapHistory } from "@/app/types/swaps"

export interface AccountDataContextType {
    balances: AccountBalancesContextType,
    history: AccountHistoryContextType,
    refetch: () => void,
}

export interface AccountBalancesContextType {
    data: Token[],
    getTokenBalance: (token?: Token) => TokenBalance,
    getTokenBalanceData: (token?: Token) => Token | undefined,
    refetch: () => void,
}

export interface AccountHistoryContextType {
    data: SwapHistory[],
    getSwapHistory: (txid?: Hash) => SwapHistory | undefined,
    addSwapHistory: (quote?: RouteQuote, txReceipt?: TransactionReceipt) => void,
    updateSwapHistoryStatus: (swapHistory?: SwapHistory) => void,
    latestSwapHistory: SwapHistory | undefined,
    refetch: () => void,
}

export type RainbowKitAccount = {
    address: string,
    balanceDecimals?: number,
    balanceFormatted?: string,
    balanceSymbol?: string,
    displayBalance?: string,
    displayName: string,
    ensAvatar?: string,
    ensName?: string,
    hasPendingTransactions: boolean,
}
