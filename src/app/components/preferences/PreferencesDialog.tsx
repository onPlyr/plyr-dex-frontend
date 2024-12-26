"use client"

import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"

import Button from "@/app/components/ui/Button"
import { DecimalInput } from "@/app/components/ui/DecimalInput"
import { Dialog, DialogProps } from "@/app/components/ui/Dialog"
import Label from "@/app/components/ui/Label"
import { Switch } from "@/app/components/ui/Switch"
import { defaultSlippageBps, defaultSlippagePercent, slippagePercentOptions } from "@/app/config/swaps"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { PreferenceType, UserPreferences } from "@/app/types/preferences"

const SwitchItem = ({
    label,
    htmlFor,
    pressed,
    setPressed,
}: {
    label: React.ReactNode,
    htmlFor: string,
    pressed: boolean,
    setPressed: (pressed: boolean) => void,
}) => (
    <div className="flex flex-row flex-1 gap-4 items-center">
        <Label
            htmlFor={htmlFor}
            className="flex flex-row flex-1"
        >
            {label}
        </Label>
        <div className="flex flex-row flex-1 justify-end items-center">
            <Switch
                pressed={pressed}
                setPressed={setPressed}
            />
        </div>
    </div>
)

// todo: add individual field validation and present errors to the user
export const PreferencesDialog = React.forwardRef<React.ElementRef<typeof Dialog>, DialogProps>(({
    trigger,
    header,
    disabled = false,
    ...props
}, ref) => {

    const { preferences, setUserPreferences, validateAllPreferences } = usePreferences()

    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isUnsaved, setIsUnsaved] = useState<boolean>(false)

    const [darkMode, setDarkMode] = useState<boolean>(preferences[PreferenceType.DarkMode] ?? false)
    const toggleDarkMode = useCallback((pressed: boolean) => {
        setDarkMode(pressed)
    }, [setDarkMode])

    const [slippagePercent, setSlippagePercent] = useState<string>(preferences[PreferenceType.Slippage] !== undefined ? (preferences[PreferenceType.Slippage] / 100).toString() : defaultSlippagePercent)
    const [slippageBps, setSlippageBps] = useState<number>(preferences[PreferenceType.Slippage] ?? defaultSlippageBps)
    const [isSlippageValid, setIsSlippageValid] = useState<boolean>(false)

    const setSlippage = useCallback((value: string) => {
        setSlippagePercent(value)
        const bps = Math.floor(parseFloat(value) * 100)
        setSlippageBps(bps)

        if (bps !== undefined && Number.isNaN(bps) !== true && bps >= 0 && bps <= 10000) {
            setIsSlippageValid(true)
        } else {
            setIsSlippageValid(false)
        }
        
    }, [setSlippagePercent, setSlippageBps, setIsSlippageValid])

    const [directRouteOnly, setDirectRouteOnly] = useState<boolean>(preferences[PreferenceType.DirectRouteOnly] ?? false)
    const toggleDirectRouteOnly = useCallback((pressed: boolean) => {
        setDirectRouteOnly(pressed)
    }, [setDirectRouteOnly])

    const [excludeChains, setExcludeChains] = useState<boolean>(preferences[PreferenceType.ExcludeChains] ?? false)
    const toggleExcludeChains = useCallback((pressed: boolean) => {
        setExcludeChains(pressed)
    }, [setExcludeChains])
    

    const saveUserPreferences = useCallback(() => {

        const newPreferences: UserPreferences = {
            [PreferenceType.DarkMode]: darkMode,
            [PreferenceType.Slippage]: slippageBps,
            [PreferenceType.DirectRouteOnly]: directRouteOnly,
            [PreferenceType.ExcludeChains]: excludeChains,
        }

        if (validateAllPreferences(newPreferences)) {
            setUserPreferences(newPreferences)
            setIsUnsaved(false)
            setIsOpen(false)
        }

    }, [setIsOpen, setIsUnsaved, setUserPreferences, validateAllPreferences, darkMode, slippageBps, directRouteOnly, excludeChains])

    useEffect(() => {

        let unsaved = false

        if (darkMode !== preferences[PreferenceType.DarkMode]) {
            unsaved = true
        } else if (slippageBps !== preferences[PreferenceType.Slippage]) {
            unsaved = true
        } else if (directRouteOnly !== preferences[PreferenceType.DirectRouteOnly]) {
            unsaved = true
        } else if (excludeChains !== preferences[PreferenceType.ExcludeChains]) {
            unsaved = true
        }

        setIsUnsaved(unsaved)

    }, [preferences, darkMode, slippageBps, directRouteOnly, excludeChains])

    return (
        <Dialog
            ref={ref}
            trigger={trigger}
            header={header}
            open={isOpen}
            onOpenChange={setIsOpen}
            disabled={disabled}
            className="px-6"
            {...props}
        >
            {/* <SwitchItem
                label="Dark mode"
                htmlFor="darkMode"
                pressed={darkMode}
                setPressed={toggleDarkMode}
            /> */}
            <div className="flex flex-row flex-1 font-bold">
                Slippage tolerance
            </div>
            <div className="flex-1 grid grid-cols-4 gap-4">
                
                {slippagePercentOptions.map((option, i) => (
                    <button
                        className={twMerge(Number(slippagePercent) === Number(option) ? "btn" : "btn-inactive")}
                        key={i}
                        onClick={setSlippage.bind(this, option)}
                    >
                        {option}%
                    </button>
                ))}
                <div className="flex flex-row flex-1 relative">
                    <DecimalInput
                        setValue={setSlippage}
                        value={slippagePercent}
                        placeholder={preferences[PreferenceType.Slippage] !== undefined ? (preferences[PreferenceType.Slippage] / 100).toString() : defaultSlippagePercent}
                        maxLength={5}
                    />
                    <div className="flex flex-col shrink absolute end-2 h-full px-2 justify-center items-center">%</div>
                </div>
            </div>
            {/* <SwitchItem
                label="Direct route only"
                htmlFor="directRouteOnly"
                pressed={directRouteOnly}
                setPressed={toggleDirectRouteOnly}
            />
            <SwitchItem
                label="Exclude chains"
                htmlFor="excludeChains"
                pressed={excludeChains}
                setPressed={toggleExcludeChains}
            /> */}
            <div className={twMerge("flex flex-row flex-1 px-14 pt-4 justify-center items-center relative text-center", isUnsaved ? "text-white" : "text-muted-500")}>
                Please remember to save your preferences for any changes to take effect.
            </div>
            <div className="flex flex-row flex-1">
                <Button
                    className="btn-gradient btn-full"
                    onClick={saveUserPreferences}
                    disabled={!isUnsaved || !isSlippageValid}
                >
                    {isUnsaved ? "Save Changes" : "Preferences Saved"}
                </Button>
            </div>
        </Dialog>

    )
})
PreferencesDialog.displayName = "PreferencesDialog"

export default PreferencesDialog
