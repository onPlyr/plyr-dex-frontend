"use client"

import { motion, Transition, Variants } from "motion/react"
import React, { useCallback } from "react"
import { twMerge } from "tailwind-merge"
import { useAccount } from "wagmi"

import AccountIcon from "@/app/components/icons/AccountIcon"
import CloseIcon from "@/app/components/icons/CloseIcon"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import RecipientIcon from "@/app/components/icons/RecipientIcon"
import Button from "@/app/components/ui/Button"
import TextInput from "@/app/components/ui/TextInput"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { iconSizes } from "@/app/config/styling"
import { UseSwapRecipientReturnType } from "@/app/hooks/swap/useSwapRecipient"

interface SwapRecipientInputProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
    useSwapRecipientData: UseSwapRecipientReturnType,
    variants?: Variants,
    transition?: Transition,
}

const defaultTransition: Transition = {
    type: "spring",
    duration: 0.2,
}

const defaultVariants: Variants = {
    initial: {
        y: "-50%",
        opacity: 0,
        height: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
        height: "auto",
    },
    exit: {
        y: "-50%",
        opacity: 0,
        height: 0,
    },
}

const SwapRecipientInput = React.forwardRef<React.ComponentRef<typeof motion.div>, SwapRecipientInputProps>(({
    className,
    useSwapRecipientData,
    variants = defaultVariants,
    transition = defaultTransition,
    ...props
}, ref) => {

    const { address: accountAddress } = useAccount()
    const { recipient, recipientInput, setRecipientInput, showRecipient, isInProgress, isError, msg, setSwapRecipient } = useSwapRecipientData
    const enabled = !(!recipient || isInProgress || isError)

    const handleRecipientInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRecipientInput(event.target.value)
    }, [setRecipientInput])

    return showRecipient && (
        <motion.div
            ref={ref}
            className="overflow-hidden"
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            variants={variants}
            {...props}
        >
            <div className={twMerge("container flex flex-col flex-1 p-4 mt-4 gap-4", className)}>
                <div className="relative flex flex-row flex-1 gap-4">
                    <RecipientIcon className={iconSizes.sm} />
                    <div className="flex flex-row flex-1 justify-start items-center font-bold">
                        Send to a different address
                    </div>
                    <Button
                        label="Close"
                        className="icon-btn absolute end-0 transition hover:text-white hover:rotate-[360deg]"
                        replaceClass={true}
                        onClick={useSwapRecipientData.setShowRecipient.bind(this, false)}
                    >
                        <CloseIcon className={iconSizes.xs} />
                    </Button>
                </div>
                <div
                    className="input-container flex flex-row flex-1 px-3 py-2 gap-4"
                    data-error={isError}
                    // data-success={enabled}
                >
                    <TextInput
                        value={recipientInput}
                        handleInput={handleRecipientInput.bind(this)}
                        placeholder="0x..."
                        maxLength={42}
                        className="p-0 m-0"
                    />
                    <Tooltip
                        trigger=<Button
                            label="Use connected account"
                            className="icon-btn"
                            replaceClass={true}
                            onClick={accountAddress ? setRecipientInput.bind(this, accountAddress) : undefined}
                            disabled={!accountAddress}
                        >
                            <AccountIcon className={iconSizes.sm} />
                        </Button>
                    >
                        Use connected account
                    </Tooltip>
                </div>
                <Button
                    className="form-btn"
                    replaceClass={true}
                    onClick={enabled ? setSwapRecipient.bind(this) : undefined}
                    disabled={!enabled}
                    data-success={enabled}
                >
                    {msg}
                    {isInProgress && <LoadingIcon className={iconSizes.xs} />}
                </Button>
            </div>
        </motion.div>
    )
})
SwapRecipientInput.displayName = "SwapRecipientInput"

export default SwapRecipientInput