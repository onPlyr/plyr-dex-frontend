import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

import logoIcon from "@/public/logos/plyrswap-black.svg"
import Image from "next/image"
import { twMerge } from "tailwind-merge"

const PlyrSwapBlackIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    className,
    ...props
}, ref) => (
    <BaseIcon
        ref={ref}
        className={twMerge("relative", className)}
        {...props}
    >
        {children ?? (
            <Image
                src={logoIcon}
                alt="Tesseract"
                style={{
                    objectFit: "contain",
                    objectPosition: "center",
                }}
                sizes="64px"
                quality={100}
                fill={true}
                priority={true}
            />
        )}
    </BaseIcon>
))
PlyrSwapBlackIcon.displayName = "PlyrSwapBlackIcon"

export default PlyrSwapBlackIcon
