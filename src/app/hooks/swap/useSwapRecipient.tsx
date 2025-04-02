import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"
import { Address, isHex } from "viem"
import { getBalance, getBytecode } from "@wagmi/core"

import { wagmiConfig } from "@/app/config/wagmi"
import useDebounce from "@/app/hooks/utils/useDebounce"
import { getParsedError, isValidAddress } from "@/app/lib/utils"
import { isValidSwapQuote, SwapQuote } from "@/app/types/swaps"

export interface UseSwapRecipientReturnType {
    recipient?: Address,
    recipientInput: string,
    setRecipientInput: (value: string) => void,
    showRecipient: boolean,
    setShowRecipient: Dispatch<SetStateAction<boolean>>,
    isInProgress: boolean,
    isError: boolean,
    msg: string,
    warningMsg?: string,
    setSwapRecipient: () => void,
    cancelInput: () => void,
}

interface ValidateRecipientResult {
    msg?: string,
    address?: Address,
    isValid: boolean,
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
    const [warningMsg, setWarningMsg] = useState<string>()
    const [isInProgress, setIsInProgress] = useState(false)
    const [isError, setIsError] = useState(false)
    const [msg, setMsg] = useState("Enter address")

    const setRecipientInput = useCallback((value: string) => {
        setRecipientInputState(value.trim())
        setIsInProgress(value.trim().toLowerCase() !== recipientDebounced.toLowerCase())
    }, [setRecipientInputState, recipientDebounced, setIsInProgress])

    const validateRecipient = useCallback(async (recipientAddress?: string) => {

        const warningMsgs: string[] = []
        const result: ValidateRecipientResult = {
            isValid: false,
        }

        try {

            if (!recipientAddress || !isValidAddress(recipientAddress)) {
                throw new Error(recipientAddress ? "Invalid address" : "Enter address")
            }
            else if (!swap || !isValidSwapQuote(swap)) {
                throw new Error(swap ? "Invalid quote" : "Select quote")
            }

            const recipientBytecode = await getBytecode(wagmiConfig, {
                chainId: swap.dstData.chain.id,
                address: recipientAddress,
            })

            if (isHex(recipientBytecode)) {
                warningMsgs.push("Recipient is a contract")
            }

            const { value: recipientBalance, symbol } = await getBalance(wagmiConfig, {
                chainId: swap.dstData.chain.id,
                address: recipientAddress,
            })

            if (recipientBalance === BigInt(0)) {
                warningMsgs.push(`Recipient has no ${symbol} for gas`)
            }

            result.msg = warningMsgs.length ? `${warningMsgs.join(". ")}.` : undefined
            result.address = recipientAddress
            result.isValid = true
        }

        catch (err) {
            result.msg = getParsedError(err)
            result.isValid = false
        }

        return result

    }, [swap])

    useEffect(() => {
        validateRecipient(recipientDebounced).then(({ msg, address, isValid }) => {
            setMsg(isValid ? `Save${msg ? " anyway" : ""}` : (msg ?? "Invalid address"))
            setRecipient(isValid ? address : undefined)
            setIsError(Boolean(recipientDebounced && !isValid))
            setIsInProgress(false)
            if (isValid) {
                setWarningMsg(msg)
            }
        })
    }, [recipientDebounced])

    const setSwapRecipient = useCallback(() => {
        if (swap && isValidSwapQuote(swap)) {
            setSwap((prev) => (prev && {
                ...prev,
                recipientAddress: recipient,
            }))
            setShowRecipient(false)
        }
    }, [swap, setSwap, recipient, setShowRecipient])

    const cancelInput = useCallback(() => {
        setRecipientInput("")
        setShowRecipient(false)
    }, [setRecipientInput, setShowRecipient])

    return {
        recipient,
        recipientInput,
        setRecipientInput,
        showRecipient,
        setShowRecipient,
        isInProgress,
        isError,
        msg,
        warningMsg,
        setSwapRecipient,
        cancelInput,
    }
}

export default useSwapRecipient
