"use client"

import { motion, Transition, Variants } from "motion/react"
import React from "react"
import { twMerge } from "tailwind-merge"

import CloseIcon from "@/app/components/icons/CloseIcon"
import SlippageIcon from "@/app/components/icons/SlippageIcon"
import Button from "@/app/components/ui/Button"
import { DecimalInput } from "@/app/components/ui/DecimalInput"
import { SelectItem } from "@/app/components/ui/SelectItem"
import { DefaultUserPreferences } from "@/app/config/preferences"
import { iconSizes } from "@/app/config/styling"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { UseSwapSlippageReturnType } from "@/app/hooks/swap/useSwapSlippage"
import { PreferenceType, SlippageConfig } from "@/app/types/preferences"

interface SwapSlippageInputProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
    useSwapSlippageData: UseSwapSlippageReturnType,
    variants?: Variants,
    transition?: Transition,
}

const defaultTransition: Transition = {
    type: "spring",
    duration: 0.2,
}

const defaultVariants: Variants = {
    initial: {
        y: "-50%",
        opacity: 0,
        height: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
        height: "auto",
    },
    exit: {
        y: "-50%",
        opacity: 0,
        height: 0,
    },
}

const SwapSlippageInput = React.forwardRef<React.ComponentRef<typeof motion.div>, SwapSlippageInputProps>(({
    className,
    useSwapSlippageData,
    variants = defaultVariants,
    transition = defaultTransition,
    ...props
}, ref) => {

    const { preferences } = usePreferences()

    return (
        <motion.div
            ref={ref}
            className="overflow-hidden"
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            variants={variants}
            {...props}
        >
            <div className={twMerge("container flex flex-col flex-1 p-4 mt-4 gap-4", className)}>
                <div className="relative flex flex-row flex-1 gap-4">
                    <SlippageIcon className={iconSizes.sm} />
                    <div className="flex flex-row flex-1 justify-start items-center font-bold">
                        Adjust slippage
                    </div>
                    <Button
                        label="Close"
                        className="icon-btn absolute end-0 transition hover:text-white hover:rotate-[360deg]"
                        replaceClass={true}
                        onClick={useSwapSlippageData.setShowSlippage.bind(this, false)}
                    >
                        <CloseIcon className={iconSizes.xs} />
                    </Button>
                </div>
                <div className="flex flex-row flex-1 gap-4">
                    {SlippageConfig.BpsOptions.map((option) => (
                        <SelectItem
                            key={option.bps}
                            className="container-select flex flex-row flex-1 px-3 py-2 justify-center items-center rounded-lg before:rounded-lg font-bold"
                            replaceClass={true}
                            onClick={useSwapSlippageData.setSlippageInput.bind(this, option.percent.toString())}
                            isSelected={parseFloat(useSwapSlippageData.slippageInput) === option.percent}
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                    <div
                        className="input-container flex flex-row flex-1 px-3 py-2 gap-4 rounded-lg"
                        data-error={!useSwapSlippageData.isValid}
                    >
                        <DecimalInput
                            setValue={useSwapSlippageData.setSlippageInput}
                            value={useSwapSlippageData.slippageInput}
                            placeholder={((preferences[PreferenceType.Slippage] ?? DefaultUserPreferences[PreferenceType.Slippage]) / 100).toString()}
                            maxLength={5}
                            className="p-0 m-0"
                        />
                        <div className="hidden sm:flex flex-row flex-none justify-center items-center">%</div>
                    </div>
                </div>
                <div className="flex flex-row flex-1 gap-4">
                    <Button
                        className="form-btn"
                        replaceClass={true}
                        onClick={useSwapSlippageData.cancelInput.bind(this)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="form-btn"
                        replaceClass={true}
                        onClick={useSwapSlippageData.isValid ? useSwapSlippageData.setSwapSlippage.bind(this) : undefined}
                        data-success={useSwapSlippageData.isValid}
                        disabled={!useSwapSlippageData.isValid}
                    >
                        {useSwapSlippageData.isValid ? "Save" : "Invalid amount"}
                    </Button>
                </div>
            </div>
        </motion.div>
    )
})
SwapSlippageInput.displayName = "SwapSlippageInput"

export default SwapSlippageInput
