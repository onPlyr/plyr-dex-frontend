"use client"

import * as React from "react"
import { twMerge } from "tailwind-merge"

import CloseIcon from "@/app/components/icons/CloseIcon"
import SearchIcon from "@/app/components/icons/SearchIcon"
import TextInput from "@/app/components/ui/TextInput"

interface SearchInputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
    clearValue?: () => void,
}

const SearchInput = React.forwardRef<React.ElementRef<typeof TextInput>, SearchInputProps>(({
    className,
    handleInput,
    clearValue,
    // inputMode,
    disabled,
    ...props
}, ref) => {
    const hasValue = props.value !== undefined && props.value.toString().trim().length !== 0
    return (
        <div className="flex flex-row flex-1 justify-start items-center relative">
            <TextInput
                ref={ref}
                className={twMerge("px-12", className)}
                onChange={disabled !== true ? handleInput?.bind(this) : undefined}
                inputMode="search"
                disabled={disabled}
                {...props}
            />
            <SearchIcon className="absolute start-4" />
            {hasValue && (
                <CloseIcon
                    className={twMerge("absolute end-4", hasValue ? undefined : "text-muted-500")}
                    onClick={hasValue && clearValue ? clearValue?.bind(this) : undefined}
                />
            )}
        </div>
    )
})
SearchInput.displayName = "SearchInput"

export default SearchInput
