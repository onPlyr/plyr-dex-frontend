import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

// import logoIcon from "@/public/logos/icon-white-square.png"
// import Image from "next/image"
import { twMerge } from "tailwind-merge"

const TesseractIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
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
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 595.3 595.3"
            >
                <path
                    d="M297.8,499.1c-2.6,0-4.3-.9-5.8-1.6l-155.4-90.1c-3.2-1.8-6.5-4.4-6.5-10.1v-181.3c0-4.1,2-7.6,5.6-9.6,3.9-2.3,156.4-90.7,156.4-90.7,2-1.1,3.8-1.7,5.6-1.7s3.6.5,5.6,1.7c3.3,1.9,154.9,89.8,156.4,90.7,2.4,1.4,5.6,3.9,5.6,9.6v181.3c0,6.1-3.6,8.3-5.3,9.5l-156.7,90.8c-1.5.9-3.1,1.5-5.4,1.5ZM308.8,468.7l104-60.2h-104v60.2ZM286.5,468.6v-60.2h-103.8l103.8,60.2ZM434.9,386.2l-54.3-94.5-54.6,94.5h109ZM299.8,386.2l67.7-117.1-14.4-25-82.2,142.1h28.9ZM244.9,386.2l95.2-164.7-42.5-73.9-137.2,238.6h84.5ZM443,355.7v-120.4l-52,30.1,52,90.3ZM152.3,355.7l52-90.3-52-30.1v120.4ZM379.9,246.1l52-30.1-103.9-60.2,51.9,90.3ZM215.4,246.1l51.9-90.3-103.9,60.2,52,30.1Z"
                    fill="currentColor"
                />
            </svg>
            // <Image
            //     src={logoIcon}
            //     alt="Tesseract"
            //     style={{
            //         objectFit: "contain",
            //         objectPosition: "center",
            //     }}
            //     sizes="64px"
            //     quality={100}
            //     fill={true}
            //     priority={true}
            // />
        )}
    </BaseIcon>
))
TesseractIcon.displayName = "TesseractIcon"

export default TesseractIcon
