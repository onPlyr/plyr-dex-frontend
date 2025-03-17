import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"
 import { Address, isAddress } from "viem"
 
 import { isValidSwapQuote, SwapQuote } from "@/app/types/swaps"
 import useDebounce from "@/app/hooks/utils/useDebounce"
 
 export interface UseSwapRecipientReturnType {
     recipient?: Address,
     recipientInput: string,
     setRecipientInput: (value: string) => void,
     showRecipient: boolean,
     setShowRecipient: Dispatch<SetStateAction<boolean>>,
     isInProgress: boolean,
     isError: boolean,
     msg: string,
     setSwapRecipient: () => void,
 }
 
 const useSwapRecipient = ({
     swap,
     setSwap,
 }: {
     swap?: SwapQuote,
     setSwap: Dispatch<SetStateAction<SwapQuote | undefined>>,
 }): UseSwapRecipientReturnType => {
 
     const [recipient, setRecipient] = useState(swap?.recipientAddress)
     const [recipientInput, setRecipientInputState] = useState(recipient ?? "")
     const [showRecipient, setShowRecipient] = useState(false)
 
     const recipientDebounced = useDebounce(recipientInput)
     const [isInProgress, setIsInProgress] = useState(false)
     const [isError, setIsError] = useState(false)
     const [msg, setMsg] = useState("Enter address")
 
     const setRecipientInput = useCallback((value: string) => {
         setRecipientInputState(value.trim())
         //setIsInProgress(value.trim().toLowerCase() !== recipientDebounced.toLowerCase())
     }, [setRecipientInputState, recipientDebounced, setIsInProgress])
 
     useEffect(() => {
 
         const isValid = recipientDebounced && isAddress(recipientDebounced, {
             strict: false,
         })
         const isError = !!recipientDebounced && !isValid
 
         setRecipient(isValid ? recipientDebounced : undefined)
         setIsError(isError)
         setIsInProgress(false)
 
     }, [recipientDebounced])
 
     useEffect(() => {
         setMsg(isInProgress ? "Validating address" : isError ? "Invalid address" : !recipientDebounced ? "Enter address" : "Set address")
     }, [recipientDebounced, isInProgress, isError])
 
     const setSwapRecipient = useCallback(() => {
         if (swap && isValidSwapQuote(swap)) {
             setSwap((prev) => (prev && {
                 ...prev,
                 recipientAddress: recipient,
             }))
             setShowRecipient(false)
         }
     }, [swap, setSwap, recipient, setShowRecipient])
 
     return {
         recipient,
         recipientInput,
         setRecipientInput,
         showRecipient,
         setShowRecipient,
         isInProgress,
         isError,
         msg,
         setSwapRecipient,
     }
 }
 
 export default useSwapRecipient