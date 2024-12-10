import Image from "next/image"
import * as React from "react"
import { twMerge } from "tailwind-merge"

import { imgSizes } from "@/app/config/styling"
import { Chain } from "@/app/types/chains"
import { StyleSize } from "@/app/types/styling"

export interface ChainImageProps extends React.ComponentPropsWithoutRef<"div"> {
    chain: Chain,
    size?: StyleSize,
    src?: string,
    innerClass?: string,
}

export const ChainImage = React.forwardRef<HTMLDivElement, ChainImageProps>(({
    className,
    chain,
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
            src={src || `/chains/logos/${chain.id}.png`}
            alt={chain.name}
            style={{
                objectFit: "contain",
                objectPosition: "center",
            }}
            fill={true}
            priority={true}
        />
    </div>
))
ChainImage.displayName = "ChainImage"

export const ChainImageInline = React.forwardRef<HTMLDivElement, ChainImageProps>(({
    className,
    chain,
    size,
    src,
    innerClass,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("relative block aspect-square rounded-lg bg-select-950 overflow-hidden", (size && imgSizes[size]) || imgSizes.default, className)}
        {...props}
    >
        <div className={twMerge("relative block m-1 aspect-square", innerClass)}>
            <Image
                src={src || `/chains/logos/${chain.id}.png`}
                alt={chain.name}
                style={{
                    objectFit: "contain",
                    objectPosition: "center",
                }}
                fill={true}
                priority={true}
            />
        </div>
    </div>
))
ChainImageInline.displayName = "ChainImageInline"
