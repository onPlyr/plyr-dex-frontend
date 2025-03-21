"use client"

import React from "react"
import { twMerge } from "tailwind-merge"

import CloseIcon from "@/app/components/icons/CloseIcon"
import SearchIcon from "@/app/components/icons/SearchIcon"
import TextInput from "@/app/components/ui/TextInput"
import { iconSizes } from "@/app/config/styling"

interface SearchInputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
    clearValue?: () => void,
    isDataError?: boolean,
    isDataSuccess?: boolean,
}

const SearchInput = React.forwardRef<React.ComponentRef<typeof TextInput>, SearchInputProps>(({
    className,
    handleInput,
    clearValue,
    isDataError,
    isDataSuccess,
    disabled,
    ...props
}, ref) => {
    const hasValue = props.value !== undefined && props.value.toString().trim().length !== 0
    return (
        <div
            className={twMerge("input-container flex flex-row flex-1 p-4 gap-4 justify-start items-center", className)}
            data-success={isDataSuccess}
            data-error={isDataError}
        >
            <div className="flex flex-row flex-none justify-center items-center text-muted-400">
                <SearchIcon className={iconSizes.sm} />
            </div>
            <TextInput
                ref={ref}
                className="p-0 m-0"
                onChange={!disabled ? handleInput?.bind(this) : undefined}
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