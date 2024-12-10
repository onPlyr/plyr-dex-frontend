import Image from "next/image"
import * as React from "react"
import { twMerge } from "tailwind-merge"

import { imgSizes } from "@/app/config/styling"
import { StyleSize } from "@/app/types/styling"
import { Token } from "@/app/types/tokens"

export interface TokenImageProps extends React.ComponentPropsWithoutRef<"div"> {
    token: Token,
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
        <Image
            src={src || `/tokens/logos/${token.id}.png`}
            alt={token.symbol}
            style={{
                objectFit: "contain",
                objectPosition: "center",
            }}
            fill={true}
            priority={true}
        />
    </div>
))
TokenImage.displayName = "TokenImage"
