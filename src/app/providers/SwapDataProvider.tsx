import { createContext, useCallback, useEffect, useState } from "react"
import { Hash } from "viem"

import { getStorageItem, isStorageAvailable, setStorageItem } from "@/app/lib/storage"
import { getSwapFromJson, getSwapJsonFromSwap } from "@/app/lib/swaps"
import { Chain } from "@/app/types/chains"
import { StorageDataKey, StorageType } from "@/app/types/storage"
import { Swap, SwapJson } from "@/app/types/swaps"

interface SwapDataContextType {
    data: Swap[],
    getSwap: (chain?: Chain, txHash?: Hash) => Swap | undefined,
    addSwap: (swapToAdd?: Swap) => Swap | undefined,
    updateSwap: (swapToUpdate?: Swap) => Swap | undefined,
    refetch: () => void,
}

export const SwapDataContext = createContext({} as SwapDataContextType)

const sortSwapData = (data: Swap[]) => {
    return data.sort((a, b) => a.timestamp && b.timestamp ? b.timestamp - a.timestamp : 0)
}

const SwapDataProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const storageKey = StorageDataKey.SwapData
    const storageType = StorageType.Local
    const storageAvailable = isStorageAvailable(storageType)

    const [swapData, setSwapData] = useState<Swap[]>([])

    const getStoredSwapData = useCallback(() => {

        const data: Swap[] = []
        const storageData = getStorageItem(storageKey, storageType)

        if (storageData) {
            for (const swapJson of (storageData as SwapJson[])) {
                const swap = getSwapFromJson(swapJson)
                if (swap) {
                    data.push(swap)
                }
            }
            sortSwapData(data)
        }

        return data

    }, [storageKey, storageType])

    // const clearStoredSwapData = useCallback(() => {
    //     if (storageAvailable) {
    //         setStorageItem(storageKey, undefined, storageType)
    //     }
    // }, [storageAvailable, storageKey])

    // clearStoredSwapData()

    useEffect(() => {
        if (storageAvailable) {
            setSwapData(getStoredSwapData())
        }
    }, [storageAvailable, getStoredSwapData])

    const getSwap = useCallback((chain?: Chain, txHash?: Hash) => {
        return chain && txHash ? swapData.find((swap) => swap.id.toLowerCase() === txHash.toLowerCase() && swap.srcData.chain.id === chain.id) : undefined
    }, [swapData])

    const updateSwap = useCallback((swapToUpdate?: Swap) => {

        if (swapToUpdate) {
            setSwapData(sortSwapData([
                ...swapData.filter((swap) => swap.id !== swapToUpdate.id),
                swapToUpdate,
            ]))
        }

        return swapToUpdate

    }, [swapData])

    const addSwap = useCallback((swapToAdd?: Swap) => {

        if (swapToAdd) {

            const existingSwap = getSwap(swapToAdd.srcData.chain, swapToAdd.id)
            if (existingSwap) {
                updateSwap(swapToAdd)
            }
            else {
                setSwapData(sortSwapData([
                    swapToAdd,
                    ...swapData,
                ]))
            }
        }

        return swapToAdd

    }, [swapData, getSwap, updateSwap])

    useEffect(() => {
        if (storageAvailable && swapData.length > 0) {
            const swapJson = swapData.map((swap) => getSwapJsonFromSwap(swap)).filter((data) => data !== undefined)
            setStorageItem(storageKey, swapJson, storageType)
        }
    }, [storageKey, storageType, storageAvailable, swapData])

    const context: SwapDataContextType = {
        data: swapData,
        getSwap: getSwap,
        addSwap: addSwap,
        updateSwap: updateSwap,
        refetch: getStoredSwapData,
    }

    return (
        <SwapDataContext.Provider value={context} >
            {children}
        </SwapDataContext.Provider>
    )
}

export default SwapDataProvider
