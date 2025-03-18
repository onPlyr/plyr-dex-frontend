"use client"

import React from "react"
import ExternalLink from "@/app/components/ui/ExternalLink"

export const TestnetMessage = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({
    ...props
}, ref) => (
    <div 
        ref={ref}
        className="container-select flex flex-row flex-1 p-4 gap-2 mt-4 sm:mt-0 w-full justify-between"
        data-selected={true}
        {...props}
    >
        <div className="flex flex-row flex-1 flex-wrap">
            Tesseract is currently in beta and available on testnet. Funds are not real nor transferrable to mainnet.
        </div>
        <div className="flex flex-row flex-none items-center">
            <ExternalLink
                href="https://test.core.app/tools/testnet-faucet/?subnet=c&token=c"
                className="gradient-btn px-3 py-2 font-bold text-white hover:text-white"
                iconSize="sm"
            >
                Faucet
            </ExternalLink>
        </div>
    </div>
))
TestnetMessage.displayName = "TestnetMessage"

export default TestnetMessage
