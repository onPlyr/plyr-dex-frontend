import { useCallback, useEffect, useState } from "react"
 import { Block } from "viem"
 import { getBlock, watchBlocks } from "@wagmi/core"
 
 import { SupportedChains } from "@/app/config/chains"
 import { wagmiConfig } from "@/app/config/wagmi"
 import { getParsedError } from "@/app/lib/utils"
 import { ChainId } from "@/app/types/chains"
 
 export type LatestBlockData = {
     [id in ChainId]?: Block
 }
 
 export type WatchLatestBlocksOnSuccess = (chainId: ChainId, block: Block, prevBlock?: Block) => void
 export type WatchLatestBlocksOnError = (chainId: ChainId, error: Error) => void
 export interface WatchLatestBlocksCallbacks {
     onSuccess?: WatchLatestBlocksOnSuccess,
     onError?: WatchLatestBlocksOnError,
 }
 
 export type GetLatestBlocksOnSuccess = () => void
 export type GetLatestBlocksOnError = (errorMsg: string) => void
 export interface GetLatestBlocksCallbacks {
     onSuccess?: GetLatestBlocksOnSuccess,
     onError?: GetLatestBlocksOnError,
 }
 
 const useLatestBlocks = ({
     chainIds,
     watchCallbacks,
     getCallbacks,
     isWatch = true,
 }: {
     chainIds: ChainId[],
     watchCallbacks?: WatchLatestBlocksCallbacks,
     getCallbacks?: GetLatestBlocksCallbacks,
     isWatch?: boolean,
 }) => {
 
     const [useChainIds, setUseChainIds] = useState<number[]>([])
     const [latestBlocks, setLatestBlocks] = useState<LatestBlockData>({})
 
     useEffect(() => {
         setUseChainIds(chainIds.filter((chainId) => Object.values(SupportedChains).some((chain) => !chain.isDisabled && chain.id === chainId)))
     }, [chainIds])
 
     const getOnSuccess: GetLatestBlocksOnSuccess = useCallback(() => {
         getCallbacks?.onSuccess?.()
     }, [getCallbacks])
 
     const getOnError: GetLatestBlocksOnError = useCallback((error) => {
         getCallbacks?.onError?.(error)
     }, [getCallbacks])
 
     const getLatestBlockData = useCallback(async () => {
 
         if (isWatch) {
             return
         }
 
         const latestBlockData: LatestBlockData = {}
 
         try {
             for (const chainId of useChainIds as ChainId[]) {
                 latestBlockData[chainId] = await getBlock(wagmiConfig, {
                     chainId: chainId,
                     blockTag: "finalized",
                     includeTransactions: false,
                 })
                 getOnSuccess()
             }
         }
 
         catch (err) {
             getOnError(getParsedError(err))
         }
 
         finally {
             setLatestBlocks((prev) => ({
                 ...prev,
                 ...latestBlockData,
             }))
         }
 
     }, [isWatch, useChainIds, setLatestBlocks, getOnSuccess, getOnError])
 
     useEffect(() => {
         if (!isWatch) {
             getLatestBlockData()
         }
     }, [isWatch, useChainIds, getOnSuccess, getOnError])
 
     const watchOnSuccess: WatchLatestBlocksOnSuccess = useCallback((chainId, block, prevBlock) => {
         setLatestBlocks((prev) => ({
             ...prev,
             [chainId]: block,
         }))
         watchCallbacks?.onSuccess?.(chainId, block, prevBlock)
     }, [watchCallbacks, setLatestBlocks])
 
     const watchOnError: WatchLatestBlocksOnError = useCallback((chainId, error) => {
         watchCallbacks?.onError?.(chainId, error)
     }, [watchCallbacks])
 
     useEffect(() => {
 
         if (!isWatch) {
             return
         }
 
         const unwatchBlocks = (useChainIds as ChainId[]).map((chainId) => watchBlocks(wagmiConfig, {
             chainId: chainId,
             blockTag: "finalized",
             emitOnBegin: true,
             syncConnectedChain: false,
             onBlock: (block, prevBlock) => {
                 watchOnSuccess(chainId, block, prevBlock)
             },
             onError: (error) => {
                 watchOnError(chainId, error)
             },
         }))
 
         return () => unwatchBlocks.forEach((unwatch) => unwatch())
 
     }, [isWatch, useChainIds, watchOnSuccess, watchOnError])
 
     const getLatestBlock = useCallback((chainId: ChainId) => {
         return latestBlocks[chainId]
     }, [latestBlocks])
 
     return {
         latestBlocks,
         getLatestBlock,
     }
 }
 
 export default useLatestBlocks