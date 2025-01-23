"use client"

import * as React from "react"
import { twMerge } from "tailwind-merge"

import CloseIcon from "@/app/components/icons/CloseIcon"
import SearchIcon from "@/app/components/icons/SearchIcon"
import TextInput from "@/app/components/ui/TextInput"
import { iconSizes } from "@/app/config/styling"

interface SearchInputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
    clearValue?: () => void,
}

const SearchInput = React.forwardRef<React.ElementRef<typeof TextInput>, SearchInputProps>(({
    className,
    handleInput,
    clearValue,
    disabled,
    ...props
}, ref) => {
    const hasValue = props.value !== undefined && props.value.toString().trim().length !== 0
    return (
        <div className="input-container flex flex-row flex-1 p-4 gap-4 justify-start items-center">
            <div className="flex flex-row flex-none justify-center items-center text-muted-400">
                <SearchIcon className={iconSizes.sm} />
            </div>
            <TextInput
                ref={ref}
                className={twMerge("p-0 m-0", className)}
                onChange={disabled ? undefined : handleInput?.bind(this)}
                inputMode="search"
                disabled={disabled}
                {...props}
            />
            <div className="flex flex-row flex-none justify-center items-center text-muted-400">
                <CloseIcon
                    className={twMerge("transition hover:text-white", iconSizes.sm, hasValue ? "visible" : "invisible")}
                    onClick={hasValue && clearValue ? clearValue?.bind(this) : undefined}
                />
            </div>
        </div>
    )
})
SearchInput.displayName = "SearchInput"

export default SearchInput
