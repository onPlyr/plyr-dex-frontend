import { Star } from "@phosphor-icons/react"
import React from "react"

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
    isFavourite?: boolean,
}

export const FavouriteIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, FavouriteIconProps>(({
    children,
    variant,
    isFavourite,
    ...props
}, ref) => (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ? children : variant ? variants[variant] : isFavourite ? variants[FavouriteIconVariant.Fill] : variants[FavouriteIconVariant.Default]}
        </BaseIcon>
    ))
FavouriteIcon.displayName = "FavouriteIcon"
