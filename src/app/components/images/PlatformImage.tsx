import Image from "next/image"
import * as React from "react"
import { twMerge } from "tailwind-merge"

import { imgSizes } from "@/app/config/styling"
import { StyleSize } from "@/app/types/styling"
import { Platform } from "@/app/types/platforms"

export interface PlatformImageProps extends React.ComponentPropsWithoutRef<"div"> {
    platform: Platform,
    size?: StyleSize,
    src?: string,
}

export const PlatformImage = React.forwardRef<HTMLDivElement, PlatformImageProps>(({
    className,
    platform,
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
            // src={src || `/platforms/${platform.id}/${(platform.img && (platform.img.square || platform.img.squareDark || platform.img.squareLight)) || "square.png"}`}
            src={src || `/platforms/${platform.id}/${platform.icon}`}
            alt={platform.name}
            style={{
                objectFit: "contain",
                objectPosition: "center",
            }}
            sizes="128px, 256px"
            fill={true}
            priority={true}
        />
    </div>
))
PlatformImage.displayName = "PlatformImage"
