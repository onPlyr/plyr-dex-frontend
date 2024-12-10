"use client"

import * as React from "react"
import { useEffect, useState } from "react"

import { Dialog, DialogProps } from "@/app/components/ui/Dialog"
import { Route } from "@/app/types/swaps"
import RouteDetailItem from "@/app/components/routes/RouteDetailItem"

export interface SelectRouteDialogProps extends DialogProps {
    routes?: Route[],
    selectedRoute?: Route,
    setSelectedRoute?: (route?: Route) => void,
    maxDstAmount: bigint,
}

export const SelectRouteDialog = React.forwardRef<React.ElementRef<typeof Dialog>, SelectRouteDialogProps>(({
    trigger,
    header,
    routes,
    selectedRoute,
    setSelectedRoute,
    maxDstAmount,
    disabled = false,
    ...props
}, ref) => {

    const [isOpen, setIsOpen] = useState<boolean>(false)
    const isDisabled = disabled === true || routes === undefined || routes.length === 0

    useEffect(() => {
        if (isOpen && selectedRoute) {
            setIsOpen(false)
        }
    }, [selectedRoute])

    return (
        <Dialog
            ref={ref}
            trigger={trigger}
            header={header}
            open={isOpen}
            onOpenChange={setIsOpen}
            disabled={isDisabled}
            {...props}
        >
            {routes?.map((route, i) => (
                <RouteDetailItem
                    key={i}
                    route={route}
                    allRoutes={routes}
                    selectedRoute={selectedRoute}
                    setSelectedRoute={setSelectedRoute}
                    maxDstAmount={maxDstAmount}
                    setIsOpen={setIsOpen}
                />
            ))}
        </Dialog>
    )
})
SelectRouteDialog.displayName = "SelectRouteDialog"
