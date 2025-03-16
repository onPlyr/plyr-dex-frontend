"use client"

import { createContext, useCallback } from "react"

import useReadTokensAndBalances from "@/app/hooks/tokens/useReadTokensAndBalances"
import { ChainId } from "@/app/types/chains"
import { Token, TokenId } from "@/app/types/tokens"

interface TokenDataContextType {
    data: Token[],
    getTokenData: (tokenId?: TokenId, chainId?: ChainId) => Token | undefined,
    refetch: () => void,
}

export const TokenDataContext = createContext({} as TokenDataContextType)

const TokenDataProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const { data: tokens, refetch } = useReadTokensAndBalances()
    const getTokenData = useCallback((tokenId?: TokenId, chainId?: ChainId) => {
        return tokenId && chainId ? tokens.find((token) => token.id === tokenId && token.chainId === chainId) : undefined
    }, [tokens])

    const context: TokenDataContextType = {
        data: tokens,
        getTokenData: getTokenData,
        refetch: refetch,
    }

    return (
        <TokenDataContext.Provider value={context} >
            {children}
        </TokenDataContext.Provider>
    )
}

export default TokenDataProvider
