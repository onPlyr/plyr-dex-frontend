import Image from "next/image"
import React from "react"
import { twMerge } from "tailwind-merge"

import { CurrencyIcon, CurrencyIconVariant } from "@/app/components/icons/CurrencyIcon"
import { imgSizes } from "@/app/config/styling"
import { StyleSize } from "@/app/types/styling"
import { Token } from "@/app/types/tokens"

export interface TokenImageProps extends React.ComponentPropsWithoutRef<"div"> {
    token?: Token,
    size?: StyleSize,
    src?: string,
}

export const TokenImage = React.forwardRef<HTMLDivElement, TokenImageProps>(({
    className,
    token,
    size,
    src,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("relative block rounded-full bg-select-950 aspect-square overflow-hidden", (size && imgSizes[size]) || imgSizes.default, className)}
        {...props}
    >
        {token ? (
            <Image
                src={src || `/tokens/logos/${token.icon}`}
                alt={token.symbol}
                style={{
                    objectFit: "contain",
                    objectPosition: "center",
                }}
                sizes="128px, 256px"
                fill={true}
                priority={true}
            />
        ) : (
            <CurrencyIcon
                variant={CurrencyIconVariant.UsdCircle}
                className="w-full h-full"
            />
        )}
    </div>
))
TokenImage.displayName = "TokenImage"
