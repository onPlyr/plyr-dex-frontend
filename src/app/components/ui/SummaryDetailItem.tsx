import * as React from "react"
import { twMerge } from "tailwind-merge"

import { SelectItem } from "@/app/components/ui/SelectItem"

export const SummaryDetailItem = React.forwardRef<React.ElementRef<typeof SelectItem>, React.ComponentPropsWithoutRef<typeof SelectItem>>(({
    children,
    className,
    replaceClass,
    isSelected,
    ...props
}, ref) => (
    <div className={isSelected ? "gradient-border" : "contents"}>
        <SelectItem
            ref={ref}
            className={twMerge(replaceClass !== true ? "group summary-detail-item" : undefined, className)}
            replaceClass={true}
            isSelected={isSelected}
            {...props}
        >
            {children}
        </SelectItem>
    </div>
))
SummaryDetailItem.displayName = "SummaryDetailItem"
