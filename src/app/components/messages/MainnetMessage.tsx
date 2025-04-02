"use client"

import React from "react"

export const MainnetMessage = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({
    ...props
}, ref) => (
    <div 
        ref={ref}
        className="container-select flex flex-row flex-1 p-4 gap-4 mt-4 sm:mt-0 w-full justify-between border-error-500"
        data-selected={true}
        {...props}
    >
        <div className="flex flex-row flex-1 flex-wrap">
            You are using Tesseract on mainnet with real funds.
        </div>
    </div>
))
MainnetMessage.displayName = "MainnetMessage"

export default MainnetMessage
