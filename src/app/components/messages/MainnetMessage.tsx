"use client"

import React from "react"
import WarningIcon from "@/app/components/icons/WarningIcon"

export const MainnetMessage = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({
    ...props
}, ref) => (
    <div 
        ref={ref}
        className="container-select flex flex-row flex-1 p-4 gap-4 mt-4 sm:mt-0 w-full justify-between border-error-500"
        data-selected={true}
        {...props}
    >
        <div className="flex flex-row flex-1 flex-wrap text-warning-500">
            Tesseract on mainnet is intended for development purposes only. You could lose your real funds. Continue at own risk.
        </div>
        <div className="flex flex-row flex-none items-center">
            <WarningIcon className="text-warning-500 flex-none" />
        </div>
    </div>
))
MainnetMessage.displayName = "MainnetMessage"

export default MainnetMessage
