"use client"

import * as React from "react"
import { twMerge } from "tailwind-merge"
import { useAccount } from "wagmi"

import PlusIcon from "@/app/components/icons/PlusIcon"
import Button from "@/app/components/ui/Button"
import { iconSizes } from "@/app/config/styling"
import useAddChainToWallet from "@/app/hooks/account/useAddChainToWallet"
import { Chain } from "@/app/types/chains"

export interface AddChainButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
    chain?: Chain,
    iconClass?: string,
}

export const AddChainButton = React.forwardRef<React.ElementRef<typeof Button>, AddChainButtonProps>(({
    className,
    chain,
    iconClass,
    replaceClass,
    disabled,
    ...props
}, ref) => {

    // todo: use tooltip once implemented
    const { address } = useAccount()
    const isDisabled = disabled === true || chain === undefined || address === undefined
    const addChain = useAddChainToWallet()

    return isDisabled ? <></> : (
        <Button
            ref={ref}
            label="Add Chain"
            className={replaceClass ? className : twMerge("icon-btn text-muted-500 hover:text-white hover:rotate-180", className)}
            onClick={() => addChain(chain)}
            replaceClass={true}
            {...props}
        >
            <PlusIcon className={twMerge(iconSizes.sm, iconClass)} />
        </Button>
    )
})
AddChainButton.displayName = "AddChainButton"
