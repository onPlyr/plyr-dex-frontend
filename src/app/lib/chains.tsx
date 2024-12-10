import { Address, Hash, zeroAddress } from "viem"

import { SupportedChains } from "@/app/config/chains"
import { Chain, ChainId } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"

export const isSupportedChain = (chainId: number) => {
    return Object.keys(SupportedChains).includes(chainId.toString())
}

export const getChain = (chainId: number) => {
    return isSupportedChain(chainId) ? SupportedChains[chainId as ChainId] : undefined
}

export const getDefaultBlockExplorerUrl = (chain?: Chain) => {
    return chain?.blockExplorers?.default.url
}

export const getBlockExplorerLink = ({
    chain,
    tx,
    address,
    token,
}: {
    chain?: Chain,
    tx?: Hash,
    address?: Address,
    token?: Token,
}) => {

    let url = undefined

    if (chain && (tx || address || token) && (token === undefined || (token && token.address !== zeroAddress))) {

        const baseUrl = getDefaultBlockExplorerUrl(chain)
        const type = tx ? "tx" : address ? "address" : token ? "token" : undefined
        const hash = tx ?? address ?? token?.address

        if (baseUrl && type && hash) {
            url = `${baseUrl.replace(/\/+$/, "")}/${type}/${hash}`
        }
    }

    return url
}
