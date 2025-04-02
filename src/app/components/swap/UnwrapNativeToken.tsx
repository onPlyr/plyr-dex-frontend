"use client"

import { AnimatePresence } from "motion/react"
import React, { useCallback } from "react"
import { twMerge } from "tailwind-merge"
import { erc20Abi } from "viem"
import { useAccount, useReadContract, useSwitchChain } from "wagmi"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import InfoIcon from "@/app/components/icons/InfoIcon"
import Button from "@/app/components/ui/Button"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import useWriteWithdrawNative from "@/app/hooks/swap/useWriteWithdrawNative"
import useTokens from "@/app/hooks/tokens/useTokens"
import { getChain } from "@/app/lib/chains"
import { amountToLocale } from "@/app/lib/numbers"
import { getTxActionLabel } from "@/app/lib/txs"
import { NumberFormatType } from "@/app/types/numbers"
import { isNativeToken } from "@/app/types/tokens"
import { TxAction, TxLabelType } from "@/app/types/txs"

export const UnwrapNativeToken = React.forwardRef<React.ComponentRef<"div">, React.ComponentPropsWithoutRef<"div">>(({
    className,
    ...props
}, ref) => {

    const { address: accountAddress, chainId } = useAccount()
    const connectedChain = chainId ? getChain(chainId) : undefined
    const { swapRoute: { srcData: { chain, token } } } = useQuoteData()
    const { switchChain } = useSwitchChain()
    const { refetch: refetchTokens } = useTokens()
    const unwrapEnabled = !(!connectedChain || !accountAddress || !chain || !token || isNativeToken(token) || !token.wrappedAddress)

    const { data: wrappedBalance, refetch: refetchWrappedBalance } = useReadContract({
        chainId: chain?.id,
        address: token?.wrappedAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: accountAddress ? [accountAddress] : undefined,
        query: {
            enabled: unwrapEnabled,
        },
    })

    const unwrapOnSuccess = useCallback(() => {
        refetchTokens()
        refetchWrappedBalance()
    }, [refetchTokens, refetchWrappedBalance])

    const { write: writeUnwrap, isInProgress } = useWriteWithdrawNative({
        connectedChain: connectedChain,
        accountAddress: accountAddress,
        token: token,
        amount: wrappedBalance,
        callbacks: {
            onSuccess: unwrapOnSuccess,
        },
        _enabled: unwrapEnabled,
    })

    const enabled = unwrapEnabled && !!wrappedBalance && wrappedBalance > BigInt(0)
    const switchChainRequired = enabled && connectedChain.id !== chain.id
    const handleSwitchChain = useCallback(() => {
        if (switchChainRequired) {
            switchChain({
                chainId: chain.id,
            })
        }
    }, [switchChainRequired, chain, switchChain])

    return (
        <AnimatePresence mode="wait">
            {enabled && wrappedBalance && wrappedBalance > BigInt(0) && (
                <ScaleInOut
                    key={`${chain.id}-${token.id}`}
                    layout={true}
                >
                    <div
                        ref={ref}
                        className={twMerge("container flex flex-row flex-1 p-4 gap-4 items-center", className)}
                        {...props}
                    >
                        <InfoIcon className="text-info-500" />
                        <div className="flex flex-row flex-1">
                            You have {amountToLocale(wrappedBalance, token.decimals, NumberFormatType.Precise)} {token.wrappedToken ?? `W${token.symbol}`} that can be unwrapped for {token.symbol}.
                        </div>
                        <Button
                            className={twMerge("gradient-btn px-3 py-2 h-fit rounded-lg", className)}
                            onClick={enabled ? switchChainRequired ? handleSwitchChain.bind(this) : writeUnwrap.bind(this) : undefined}
                            isAnimated={true}
                        >
                            {switchChainRequired ? `Switch to ${chain.name}` : getTxActionLabel(TxAction.Unwrap, isInProgress ? TxLabelType.InProgress : TxLabelType.Default)}
                        </Button>
                    </div>
                </ScaleInOut>
            )}
        </AnimatePresence>
    )
})
UnwrapNativeToken.displayName = "UnwrapNativeToken"
