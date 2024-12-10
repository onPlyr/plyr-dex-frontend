"use client"

import * as React from "react"
import { twMerge } from "tailwind-merge"
import { Address } from "viem"

import AccountIcon from "@/app/components/icons/AccountIcon"
import Button from "@/app/components/ui/Button"
import useReadAvvyName from "@/app/hooks/avvy/useReadAvvyName"
import { RainbowKitAccount } from "@/app/types/account"

const AccountButtonDetail = ({
    children,
    className,
}: {
    children?: React.ReactNode,
    className?: string,
}) => {
    return (
        <div className={twMerge("flex flex-row h-full px-3 justify-center items-center transition rounded-lg text-nowrap", className)}>
            {children}
        </div>
    )
}

export interface AccountButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
    account?: RainbowKitAccount,
    accountAddress?: Address,
}

export const AccountButton = React.forwardRef<React.ElementRef<typeof Button>, AccountButtonProps>(({
    className,
    account,
    accountAddress,
    disabled = false,
    ...props
}, ref) => {

    const { formattedName: avvyName } = useReadAvvyName({
        accountAddress: accountAddress,
    })

    return account ? (
        <Button
            className={twMerge("btn-gradient group p-0 gap-0", className)}
            disabled={disabled}
            ref={ref}
            {...props}
        >
            <AccountButtonDetail className="gap-3">
                <AccountIcon />
                <div className="hidden sm:flex">
                    {account.displayBalance}
                </div>
            </AccountButtonDetail>
            <AccountButtonDetail className="py-2 bg-transparent sm:bg-input-900/50 sm:hover:bg-input-900/25">
                {avvyName ?? account.displayName}
            </AccountButtonDetail>
        </Button>
    ) : <></>
})
AccountButton.displayName = "AccountButton"
