import { IconContext, IconProps } from "@phosphor-icons/react"
import * as React from "react"
import { twMerge } from "tailwind-merge"

import { iconSizes } from "@/app/config/styling"
import { StyleDirection, StyleShape, StyleToggleDirection } from "@/app/types/styling"

export interface BaseIconProps extends React.ComponentPropsWithoutRef<"div"> {
    iconProps?: IconProps,
    highlight?: boolean,
    highlightStyle?: string,
    animate?: boolean,
    animateStyle?: string,
    direction?: StyleDirection,
    toggleDirection?: StyleToggleDirection,
    shape?: StyleShape,
}

export const BaseIcon = React.forwardRef<HTMLDivElement, BaseIconProps>(({
    children,
    className,
    onClick,
    iconProps,
    highlight,
    highlightStyle = "text-tes-500",
    animate,
    animateStyle,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    direction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toggleDirection,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shape,
    ...props
}, ref) => {

    const iconProviderProps: IconProps = {
        ...iconProps,
        className: twMerge("w-full h-full aspect-square", iconProps?.className),
    }

    return (
        <IconContext.Provider value={iconProviderProps}>
            <div
                ref={ref}
                className={twMerge(
                    "p-0 m-0",
                    iconSizes.default,
                    highlight && highlightStyle,
                    animate && animateStyle ? animateStyle : "animate-none",
                    onClick && "cursor-pointer",
                    className,
                )}
                onClick={onClick?.bind(this)}
                {...props}
            >
                {children}
            </div>
        </IconContext.Provider>
    )

})
BaseIcon.displayName = "BaseIcon"
