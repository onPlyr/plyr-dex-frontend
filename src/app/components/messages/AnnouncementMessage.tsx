"use client"

import React from "react"
import ExternalLink from "@/app/components/ui/ExternalLink"

export const AnnouncementMessage = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({
    ...props
}, ref) => (
    <div 
        ref={ref}
        className="container-select flex flex-row p-4 gap-2 w-full mt-4 mb-4 sm:mt-0 justify-between"
        data-selected={true}
        {...props}
    >
        <div className="flex flex-row flex-1 flex-wrap">
            Announcement here .... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce suscipit, lectus eu aliquet viverra, sem nisl convallis lectus, et bibendum eros tortor eget ante. Nunc leo orci, venenatis id tellus vitae, hendrerit iaculis neque.
        </div>
        <div className="flex flex-row flex-none items-center">
            <ExternalLink
                href="https://test.core.app/tools/testnet-faucet/?subnet=c&token=c"
                className="gradient-btn px-3 py-2 font-bold text-black"
                iconSize="sm"
            >
                Read More
            </ExternalLink>
        </div>
    </div>
))
AnnouncementMessage.displayName = "AnnouncementMessage"

export default AnnouncementMessage
