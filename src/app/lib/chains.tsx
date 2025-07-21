import { Address, Hash, zeroAddress } from "viem"

import { SupportedChains } from "@/app/config/chains"
import { Chain, isSupportedChainId } from "@/app/types/chains"
import { NetworkMode } from "@/app/types/preferences"
import { Token } from "@/app/types/tokens"

export const getChain = (chainId: number) => {
    return isSupportedChainId(chainId) && !SupportedChains[chainId].isDisabled ? SupportedChains[chainId] : undefined
}

export const getChainByBlockchainId = (blockchainId?: Hash) => {
    return blockchainId ? Object.values(SupportedChains).find((chain) => chain.blockchainId.toLowerCase() === blockchainId.toLowerCase() && !chain.isDisabled) : undefined
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

export const getFilteredChains = (networkMode: NetworkMode) => {
    return Object.values(SupportedChains).filter(chain => 
        networkMode === NetworkMode.Testnet ? chain.testnet === true : chain.testnet !== true
    )
}

// returns as number rather than chain id to avoid triggering dependency array changes while watching blocks
export const getNetworkModeChainIds = (networkMode: NetworkMode) => getFilteredChains(networkMode).map((chain) => Number(chain.id))
export const getChainNetworkMode = (chainId: number) => getNetworkModeChainIds(NetworkMode.Mainnet).includes(chainId) ? NetworkMode.Mainnet : getNetworkModeChainIds(NetworkMode.Testnet).includes(chainId) ? NetworkMode.Testnet : undefined