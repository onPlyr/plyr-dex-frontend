import { useCallback, useEffect, useState } from "react"
 import { Address, erc20Abi, formatUnits } from "viem"
 import { useAccount } from "wagmi"
 import { getBalance, readContracts } from "@wagmi/core"
 
 import { defaultNetworkMode } from "@/app/config/chains"
 import { wagmiConfig } from "@/app/config/wagmi"
 import usePreferences from "@/app/hooks/preferences/usePreferences"
 import { getFilteredChains } from "@/app/lib/chains"
 import { getParsedError } from "@/app/lib/utils"
 import { ChainId } from "@/app/types/chains"
 import { PreferenceType } from "@/app/types/preferences"
 import { Token } from "@/app/types/tokens"
 
 export interface UseBalancesReturnType {
     tokens: Token[],
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
 
 const useBalances = ({
     supportedTokens,
     customTokens,
 }: {
     supportedTokens: Token[],
     customTokens: Token[],
 }): UseBalancesReturnType => {
 
     const { address: accountAddress, isDisconnected } = useAccount()
     const { preferences } = usePreferences()
     const networkMode = preferences[PreferenceType.NetworkMode] ?? defaultNetworkMode
     const [tokens, setTokens] = useState([
         ...supportedTokens,
         ...customTokens,
     ])
     const [isInProgress, setIsInProgress] = useState(false)
     const [errorMsg, setErrorMsg] = useState("")
     const enabled = !!accountAddress && !isDisconnected
 
     const getTokenBalances = useCallback(async () => {
 
         const tokens = [
             ...supportedTokens,
             ...customTokens,
         ]
 
         let errorMsg = ""
 
         try {
 
             if (!enabled || isInProgress) {
                 return
             }
 
             setIsInProgress(true)
 
             const queryTokens = getFilteredChains(networkMode).map((chain) => tokens.filter((token) => token.chainId === chain.id)).flat()
             const nativeQueries = queryTokens.filter((token) => token.isNative).map((token) => getBalance(wagmiConfig, {
                 chainId: token.chainId,
                 address: accountAddress,
             }))
             const tokenQueries: TokenBalanceQuery[] = queryTokens.filter((token) => !token.isNative).map((token) => ({
                 chainId: token.chainId,
                 address: token.address,
                 abi: erc20Abi,
                 functionName: "balanceOf",
                 args: [accountAddress],
             }))
 
             const nativeResults = await Promise.allSettled(nativeQueries).then((results) => results.map((data) => data.status === "fulfilled" ? data.value.value : undefined))
             const tokenResults = await readContracts(wagmiConfig, {
                 contracts: tokenQueries,
             })
 
             let nativeIndex = 0
             let tokenIndex = 0
 
             for (const token of queryTokens) {
 
                 if (token.isNative) {
                     token.balance = nativeResults[nativeIndex]
                     nativeIndex++
                 }
 
                 else {
                     token.balance = tokenResults[tokenIndex].result
                     tokenIndex++
                 }
 
                 token.balanceFormatted = token.balance ? formatUnits(token.balance, token.decimals) : undefined
             }
         }
 
         catch (err) {
             errorMsg = getParsedError(err)
         }
 
         finally {
             setTokens(tokens)
             setErrorMsg(errorMsg)
             setIsInProgress(false)
         }
 
     }, [enabled, supportedTokens, customTokens, accountAddress, networkMode, setTokens, isInProgress, setIsInProgress, setErrorMsg])
 
     useEffect(() => {
         console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>> getTokenBalances enabled: ${enabled ? "yes" : "NO"}`)
         if (enabled && !isInProgress) {
             getTokenBalances()
         }
     }, [enabled, supportedTokens, customTokens, accountAddress, networkMode])
 
     useEffect(() => console.log("CHANGED: enabled"), [enabled])
     useEffect(() => console.log("CHANGED: supportedTokens"), [supportedTokens])
     useEffect(() => console.log("CHANGED: customTokens"), [customTokens])
     useEffect(() => console.log("CHANGED: accountAddress"), [accountAddress])
     useEffect(() => console.log("CHANGED: networkMode"), [networkMode])
 
     return {
         tokens: tokens,
         isInProgress: isInProgress,
         error: errorMsg,
         refetch: getTokenBalances,
     }
 }
 
 export default useBalances