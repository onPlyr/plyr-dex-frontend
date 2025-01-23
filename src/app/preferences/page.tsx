"use client"

import React from "react"
import { useCallback, useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"

import { CurrencyIcon } from "@/app/components/icons/CurrencyIcon"
import { DecimalInput } from "@/app/components/ui/DecimalInput"
import { Page } from "@/app/components/ui/Page"
import { SelectItem } from "@/app/components/ui/SelectItem"
import { Currency, defaultCurrency } from "@/app/config/numbers"
import { SwapTab } from "@/app/config/pages"
import { iconSizes } from "@/app/config/styling"
import { defaultSlippageBps, defaultSlippagePercent, slippagePercentOptions } from "@/app/config/swaps"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useDebounce from "@/app/hooks/utils/useDebounce"
import { getCurrencyLabel } from "@/app/lib/numbers"
import { PreferenceType, UserPreferences } from "@/app/types/preferences"
import ScaleInOut from "../components/animations/ScaleInOut"

const PreferenceHeaderRow = ({
    label,
    isError,
    errorMsg,
}: {
    label: React.ReactNode,
    isError?: boolean,
    errorMsg?: React.ReactNode,
}) => (
    <div className="flex flex-row flex-1 justify-between items-center gap-x-4 gap-y-2">
        <div className="flex flex-row flex-none justify-start items-center font-bold">
            {label}
        </div>
        <div className={twMerge(isError !== true ? "hidden" : "flex text-error-500", "flex-row flex-1 justify-end items-center text-end")}>
            {errorMsg}
        </div>
    </div>
)

const PreferencesPage = () => {

    const { preferences, setUserPreferences, validateAllPreferences, validatePreference } = usePreferences()

    const [slippagePercent, setSlippagePercent] = useState<string>(preferences[PreferenceType.Slippage] !== undefined ? (preferences[PreferenceType.Slippage] / 100).toString() : defaultSlippagePercent)
    const [slippageBps, setSlippageBps] = useState<number>(preferences[PreferenceType.Slippage] ?? defaultSlippageBps)
    const [isSlippageValid, setIsSlippageValid] = useState<boolean>(validatePreference(PreferenceType.Slippage, { [PreferenceType.Slippage]: slippageBps }))
    const slippageBpsDebounced = useDebounce(slippageBps)

    const setSlippage = useCallback((value: string) => {
        setSlippagePercent(value)
        setSlippageBps(Math.floor(parseFloat(value) * 100))
    }, [setSlippagePercent, setSlippageBps])

    const [selectedCurrency, setSelectedCurrency] = useState<Currency>(preferences[PreferenceType.Currency] ?? defaultCurrency)
    const [isCurrencyValid, setIsCurrencyValid] = useState<boolean>(validatePreference(PreferenceType.Currency, { [PreferenceType.Currency]: selectedCurrency }))

    useEffect(() => {
        setIsSlippageValid(validatePreference(PreferenceType.Slippage, { slippage: slippageBpsDebounced }))
    }, [slippageBpsDebounced])

    useEffect(() => {
        setIsCurrencyValid(validatePreference(PreferenceType.Currency, { [PreferenceType.Currency]: selectedCurrency }))
    }, [selectedCurrency])

    const savePreferences = useCallback(() => {
        const newPreferences: UserPreferences = {
            ...preferences,
        }
        if (isSlippageValid) {
            newPreferences[PreferenceType.Slippage] = slippageBpsDebounced
        }
        if (isCurrencyValid) {
            newPreferences[PreferenceType.Currency] = selectedCurrency
        }
        if (validateAllPreferences(newPreferences)) {
            setUserPreferences(newPreferences)
        }
    }, [preferences, slippageBpsDebounced, isSlippageValid, selectedCurrency, isCurrencyValid])

    useEffect(() => {
        if (isSlippageValid || isCurrencyValid) {
            savePreferences()
        }
    }, [slippageBpsDebounced, isSlippageValid, selectedCurrency, isCurrencyValid])

    return (
        <Page
            key={SwapTab.Preferences}
            header="My Preferences"
            backUrl="/swap"
        >
            <ScaleInOut className="container flex flex-col flex-none p-4 gap-4 w-full h-fit">
                <div className="flex flex-col flex-1 gap-4">
                    <PreferenceHeaderRow
                        label="Slippage"
                        isError={isSlippageValid !== true}
                        errorMsg="Invalid amount"
                    />
                    <div className="flex flex-row flex-1 gap-4">
                        {slippagePercentOptions.map((option, i) => (
                            <SelectItem
                                key={i}
                                className="container-select flex flex-row flex-1 px-3 py-2 justify-center items-center rounded-lg before:rounded-lg font-bold"
                                replaceClass={true}
                                onClick={setSlippage.bind(this, option)}
                                isSelected={slippagePercent === option}
                            >
                                {option}%
                            </SelectItem>
                        ))}
                        <div className="input-container flex flex-row flex-1 px-3 py-2 gap-4 rounded-lg" data-error={isSlippageValid !== true}>
                            <DecimalInput
                                setValue={setSlippage}
                                value={slippagePercent}
                                placeholder={preferences[PreferenceType.Slippage] !== undefined ? (preferences[PreferenceType.Slippage] / 100).toString() : defaultSlippagePercent}
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
                        isError={isCurrencyValid !== true}
                        errorMsg="Invalid currency"
                    />
                </div>
                <div className="flex flex-row flex-1 gap-4 justify-between items-center">
                    <div className="flex flex-row flex-1 flex-wrap gap-x-4 gap-y-2">
                        {Object.values(Currency).map((currency, i) => (
                            <SelectItem
                                key={i}
                                className="container-select flex flex-row flex-none ps-3 pe-4 py-2 gap-2 justify-center items-center rounded-lg before:rounded-lg font-bold"
                                replaceClass={true}
                                onClick={setSelectedCurrency.bind(this, currency)}
                                isSelected={selectedCurrency === currency}
                            >
                                <CurrencyIcon currency={currency} className={iconSizes.sm} />
                                {getCurrencyLabel(currency)}
                            </SelectItem>
                        ))}
                    </div>
                </div>
            </ScaleInOut>
        </Page>
    )
}

export default PreferencesPage
