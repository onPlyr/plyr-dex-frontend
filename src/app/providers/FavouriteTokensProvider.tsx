import { useCallback, useEffect, useState } from "react"

import { getStorageItem, isStorageAvailable, setStorageItem } from "@/app/lib/storage"
import { FavouriteTokensContext } from "@/app/lib/tokens"
import { StorageDataKey, StorageType } from "@/app/types/storage"
import { FavouriteTokenData, FavouriteTokensContextType, Token } from "@/app/types/tokens"

const FavouriteTokensProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const storageKey = StorageDataKey.FavouriteTokens
    const storageType = StorageType.Local
    const enabled = isStorageAvailable(storageType)
    const emptyFavouriteTokenData: FavouriteTokenData = {
        data: {},
    }

    const getStorageFavouriteTokenData = useCallback(() => {
        const storageData = enabled ? getStorageItem(storageKey, storageType) : undefined
        return {
            ...(storageData ? storageData : emptyFavouriteTokenData),
        } as FavouriteTokenData
    }, [enabled, storageKey, storageType])

    const setStorageFavouriteTokenData = useCallback((favourites: FavouriteTokenData) => {
        if (enabled) {
            setStorageItem(storageKey, favourites, storageType)
        }
    }, [enabled, storageKey, storageType])

    const [favouriteTokens, setFavouriteTokens] = useState<FavouriteTokenData>(getStorageFavouriteTokenData())

    const toggleFavouriteToken = useCallback((token: Token, favourites: FavouriteTokenData) => {

        const favouriteTokenChainData = favourites.data?.[token.chainId] ?? []
        const tokenIdx = favouriteTokenChainData.findIndex((tokenId) => token.id === tokenId)
        const favouriteTokenData: FavouriteTokenData = {
            ...favourites,
        }

        if (tokenIdx !== -1) {
            favouriteTokenData.data[token.chainId] = favouriteTokenChainData.filter((tokenId) => token.id !== tokenId)
        }
        else {
            favouriteTokenData.data[token.chainId] = [
                ...favouriteTokenChainData,
                token.id,
            ]
        }

        setFavouriteTokens(favouriteTokenData)

    }, [setFavouriteTokens])

    useEffect(() => {
        setStorageFavouriteTokenData(favouriteTokens)
    }, [favouriteTokens])

    const context: FavouriteTokensContextType = {
        favouriteTokens: favouriteTokens,
        toggleFavouriteToken: toggleFavouriteToken,
    }

    return (
        <FavouriteTokensContext.Provider value={context} >
            {children}
        </FavouriteTokensContext.Provider>
    )
}

export default FavouriteTokensProvider
