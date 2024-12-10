import { CircleNotch } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const LoadingIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    animate = true,
    animateStyle = "animate-spin",
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            animate={animate}
            animateStyle={animateStyle}
            {...props}
        >
            {/*{children ?? <SpinnerGap />}*/}
            {children ?? <CircleNotch />}
        </BaseIcon>
    )

})
LoadingIcon.displayName = "LoadingIcon"

export default LoadingIcon
