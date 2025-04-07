"use client"

import React from "react"
import { useCallback, useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import { CurrencyIcon } from "@/app/components/icons/CurrencyIcon"
import { DecimalInput } from "@/app/components/ui/DecimalInput"
import { Page } from "@/app/components/ui/Page"
import { SelectItem } from "@/app/components/ui/SelectItem"
import { DefaultUserPreferences } from "@/app/config/preferences"
import { getNetworkModeLabel } from "@/app/config/chains"
import { iconSizes } from "@/app/config/styling"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useDebounce from "@/app/hooks/utils/useDebounce"
import { getCurrencyLabel } from "@/app/lib/numbers"
import { Currency } from "@/app/types/currency"
import { PageType } from "@/app/types/navigation"
import { NetworkMode, PreferenceType, SlippageConfig } from "@/app/types/preferences"

type ErrorData = {
    [key in PreferenceType]?: string
}

interface PreferenceHeaderRowProps extends React.ComponentPropsWithoutRef<"div"> {
    label: React.ReactNode,
    errorMsg?: string,
}

const PreferenceHeaderRow = React.forwardRef<HTMLDivElement, PreferenceHeaderRowProps>(({
    className,
    label,
    errorMsg,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-1 justify-between items-center gap-x-4 gap-y-2", className)}
        {...props}
    >
        <div className="flex flex-row flex-none gap-4 justify-start items-center font-bold">
            {label}
        </div>
        <div className={twMerge(errorMsg ? "flex text-error-500" : "hidden", "flex-row flex-1 justify-end items-center text-end")}>
            {errorMsg}
        </div>
    </div>
))
PreferenceHeaderRow.displayName = "PreferenceHeaderRow"

const PreferencesPage = () => {

    const { getPreference, setPreference } = usePreferences()
    const [errorMsgs, setErrorMsgs] = useState<ErrorData>({})

    ////////////////////////////////////////////////////////////////////////////////
    // slippage

    const [slippageInput, setSlippageInput] = useState((getPreference(PreferenceType.Slippage) / 100).toString())
    const slippageInputDebounced = useDebounce(slippageInput)

    useEffect(() => {

        const bps = slippageInputDebounced ? Math.floor(parseFloat(slippageInputDebounced) * 100) : undefined
        const isValid = bps !== undefined && setPreference(PreferenceType.Slippage, bps)

        setErrorMsgs((prev) => ({
            ...prev,
            [PreferenceType.Slippage]: !isValid ? "Invalid amount" : undefined,
        }))

    }, [slippageInputDebounced])

    ////////////////////////////////////////////////////////////////////////////////
    // currency

    const currency = getPreference(PreferenceType.Currency)
    const setCurrency = useCallback((data: Currency) => {
        const isValid = setPreference(PreferenceType.Currency, data)
        setErrorMsgs((prev) => ({
            ...prev,
            [PreferenceType.Currency]: !isValid ? "Invalid currency" : undefined,
        }))
    }, [setPreference, setErrorMsgs])

    // todo: remove filter to allow all currencies again once supported in price api service
    const currencies = Object.values(Currency).filter((currency) => currency === DefaultUserPreferences[PreferenceType.Currency])


    ////////////////////////////////////////////////////////////////////////////////
    // network mode

    const networkMode = getPreference(PreferenceType.NetworkMode)
    const setNetworkMode = useCallback((data: NetworkMode) => {
        const isValid = setPreference(PreferenceType.NetworkMode, data)
        setErrorMsgs((prev) => ({
            ...prev,
            [PreferenceType.NetworkMode]: !isValid ? "Invalid network mode" : undefined,
        }))
    }, [setPreference, setErrorMsgs])

    return (
        <Page
            key={PageType.Preferences}
            header="My Preferences"
            backUrl="/swap"
        >
            <ScaleInOut className="container flex flex-col flex-none p-4 gap-4 w-full h-fit">
                <div className="flex flex-col flex-1 gap-4">
                    <PreferenceHeaderRow
                        label="Slippage"
                        errorMsg={errorMsgs[PreferenceType.Slippage]}
                    />
                    <div className="flex flex-row flex-1 gap-4">
                        {SlippageConfig.BpsOptions.map((option) => (
                            <SelectItem
                                key={option.bps}
                                className="container-select flex flex-row flex-1 px-3 py-2 justify-center items-center rounded-lg before:rounded-lg font-bold"
                                replaceClass={true}
                                onClick={setSlippageInput.bind(this, option.percent.toString())}
                                isSelected={slippageInput === option.percent.toString()}
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                        <div
                            className="input-container flex flex-row flex-1 px-3 py-2 gap-4 rounded-lg"
                            data-error={!!errorMsgs[PreferenceType.Slippage]}
                        >
                            <DecimalInput
                                setValue={setSlippageInput}
                                value={slippageInput}
                                placeholder={(getPreference(PreferenceType.Slippage) / 100).toString()}
                                maxLength={5}
                                className="p-0 m-0"
                            />
                            <div className="hidden sm:flex flex-row flex-none justify-center items-center">%</div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col flex-1 gap-4">
                    <PreferenceHeaderRow
                        label="Currency"
                        errorMsg={errorMsgs[PreferenceType.Currency]}
                    />
                </div>
                <div className="flex flex-row flex-1 gap-4 justify-between items-center">
                    <div className="flex flex-row flex-1 flex-wrap gap-x-4 gap-y-2">
                        {currencies.map((option) => (
                            <SelectItem
                                key={option}
                                className="container-select flex flex-row flex-none ps-3 pe-4 py-2 gap-2 justify-center items-center rounded-lg before:rounded-lg font-bold"
                                replaceClass={true}
                                onClick={setCurrency.bind(this, option)}
                                isSelected={currency === option}
                            >
                                <CurrencyIcon
                                    currency={option}
                                    className={iconSizes.sm}
                                />
                                {getCurrencyLabel(option)}
                            </SelectItem>
                        ))}
                    </div>
                </div>
                {/* <div className="flex flex-col flex-1 gap-4">
                    <PreferenceHeaderRow
                        label="Network Mode"
                        errorMsg={errorMsgs[PreferenceType.NetworkMode]}
                    />
                </div>
                <div className="flex flex-row flex-1 gap-4 justify-between items-center">
                    <div className="flex flex-row flex-1 flex-wrap gap-x-4 gap-y-2">
                        {Object.values(NetworkMode).map((mode) => (
                            <SelectItem
                                key={mode}
                                className="container-select flex flex-row flex-none px-3 py-2 gap-2 justify-center items-center rounded-lg before:rounded-lg font-bold"
                                replaceClass={true}
                                onClick={setNetworkMode.bind(this, mode)}
                                isSelected={networkMode === mode}
                            >
                                {getNetworkModeLabel(mode)}
                            </SelectItem>
                        ))}
                    </div>
                </div> */}
            </ScaleInOut>
        </Page>
    )
}

export default PreferencesPage