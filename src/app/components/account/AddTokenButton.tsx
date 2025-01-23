"use client"

import * as React from "react"
import { twMerge } from "tailwind-merge"
import { useAccount, useWatchAsset } from "wagmi"

import PlusIcon from "@/app/components/icons/PlusIcon"
import Button from "@/app/components/ui/Button"
import { iconSizes } from "@/app/config/styling"
import { Token } from "@/app/types/tokens"

export interface AddTokenButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
    token?: Token,
    iconClass?: string,
}

export const AddTokenButton = React.forwardRef<React.ElementRef<typeof Button>, AddTokenButtonProps>(({
    className,
    token,
    iconClass,
    replaceClass,
    disabled,
    ...props
}, ref) => {

    // todo: use tooltip once implemented
    // todo: add image parameter to watchasset
    // todo: add success/error toast using data option from usewatchasset
    const { address } = useAccount()
    const isDisabled = disabled === true || token === undefined || token.isNative === true || address === undefined
    // const { watchAsset, data: isAdded } = useWatchAsset()
    const { watchAsset } = useWatchAsset()

    return isDisabled ? <></> : (
        <Button
            ref={ref}
            label="Add Token"
            className={replaceClass ? className : twMerge("icon-btn text-muted-500 hover:text-white hover:rotate-180", className)}
            onClick={() => watchAsset({
                type: "ERC20",
                options: {
                    address: token.address,
                    symbol: token.symbol,
                    decimals: token.decimals,
                    // image: "",
                },
            })}
            replaceClass={true}
            {...props}
        >
            <PlusIcon className={twMerge(iconSizes.sm, iconClass)} />
        </Button>
    )
})
AddTokenButton.displayName = "AddTokenButton"
