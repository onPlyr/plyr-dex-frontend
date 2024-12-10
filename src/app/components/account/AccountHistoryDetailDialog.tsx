"use client"

import * as React from "react"
import { useState } from "react"

import SwapStatusDetailItem from "@/app/components/swap/SwapStatusDetailItem"
import { Dialog } from "@/app/components/ui/Dialog"
import { SwapHistory } from "@/app/types/swaps"

interface AccountHistoryDetailDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
    history: SwapHistory,
}

const AccountHistoryDetailDialog = React.forwardRef<React.ElementRef<typeof Dialog>, AccountHistoryDetailDialogProps>(({
    trigger,
    header,
    history,
    className,
    disabled,
    ...props
}, ref) => {

    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (
        <Dialog
            ref={ref}
            className={className}
            trigger={trigger}
            header={header}
            open={isOpen}
            onOpenChange={setIsOpen}
            disabled={disabled}
            {...props}
        >
            <SwapStatusDetailItem history={history} />
        </Dialog>
    )
})
AccountHistoryDetailDialog.displayName = "AccountHistoryDetailDialog"

export default AccountHistoryDetailDialog
