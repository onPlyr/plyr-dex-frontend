import { MagnifyingGlass } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const SearchIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? <MagnifyingGlass />}
        </BaseIcon>
    )

})
SearchIcon.displayName = "CloseIcon"

export default SearchIcon
