import { Star } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon } from "@/app/components/icons/BaseIcon"

export enum FavouriteIconVariant {
    Default = "default",
    Fill = "fill",
}

const variants: Record<FavouriteIconVariant, React.ReactNode> = {
    [FavouriteIconVariant.Default]: <Star />,
    [FavouriteIconVariant.Fill]: <Star weight="fill" />,
}

export interface FavouriteIconProps extends React.ComponentPropsWithoutRef<typeof BaseIcon> {
    variant?: FavouriteIconVariant,
}

export const FavouriteIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, FavouriteIconProps>(({
    children,
    variant,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? variants[variant ?? FavouriteIconVariant.Default]}
        </BaseIcon>
    )

})
FavouriteIcon.displayName = "FavouriteIcon"
