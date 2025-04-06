import { ListMagnifyingGlass, MagnifyingGlass, MagnifyingGlassMinus, MagnifyingGlassPlus } from "@phosphor-icons/react"
import React from "react"

import { BaseIcon } from "@/app/components/icons/BaseIcon"

export const SearchIconVariant = {
    Default: "default",
    Plus: "plus",
    Minus: "minus",
    List: "list",
} as const
export type SearchIconVariant = (typeof SearchIconVariant)[keyof typeof SearchIconVariant]

const searchIcons: Record<SearchIconVariant, React.ReactNode> = {
    [SearchIconVariant.Default]: <MagnifyingGlass />,
    [SearchIconVariant.Plus]: <MagnifyingGlassPlus />,
    [SearchIconVariant.Minus]: <MagnifyingGlassMinus />,
    [SearchIconVariant.List]: <ListMagnifyingGlass />,
}

interface SearchIconProps extends React.ComponentPropsWithoutRef<typeof BaseIcon> {
    variant?: SearchIconVariant,
}

const SearchIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, SearchIconProps>(({
    children,
    variant,
    ...props
}, ref) => (
    <BaseIcon
        ref={ref}
        {...props}
    >
        {children ?? searchIcons[variant ?? SearchIconVariant.Default]}
    </BaseIcon>
))
SearchIcon.displayName = "SearchIcon"

export default SearchIcon
