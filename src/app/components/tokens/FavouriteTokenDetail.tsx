import * as React from "react"
import { twMerge } from "tailwind-merge"

import { FavouriteIcon, FavouriteIconVariant } from "@/app/components/icons/FavouriteIcon"
import { SelectItem } from "@/app/components/ui/SelectItem"
import useFavouriteTokens from "@/app/hooks/tokens/useFavouriteTokens"
import { getIsFavouriteToken } from "@/app/lib/tokens"
import { Token } from "@/app/types/tokens"

interface FavouriteTokenDetailProps extends React.ComponentPropsWithoutRef<"div"> {
    token: Token,
}

export const FavouriteTokenDetail = React.forwardRef<React.ElementRef<typeof SelectItem>, FavouriteTokenDetailProps>(({
    className,
    token,
    ...props
}, ref) => {
    const { favouriteTokens, toggleFavouriteToken } = useFavouriteTokens()
    const isFavourite = getIsFavouriteToken(token, favouriteTokens)
    return (
        <div
            ref={ref}
            className={twMerge("flex flex-row shrink justify-center items-center", className)}
            {...props}
        >
            <FavouriteIcon
                variant={isFavourite ? FavouriteIconVariant.Fill : FavouriteIconVariant.Default}
                className={twMerge("transition", isFavourite ? "text-brand-500 hover:text-brand-400" : "text-muted-500 hover:text-muted-300")}
                onClick={(e) => {
                    toggleFavouriteToken(token, favouriteTokens)
                    e.stopPropagation()
                }}
            />
        </div>
    )
})
FavouriteTokenDetail.displayName = "FavouriteTokenDetail"

export default FavouriteTokenDetail
