"use client"

import { AnimatePresence, motion } from "motion/react"
import React from "react"
import { twMerge } from "tailwind-merge"

import { CurrencyIcon, CurrencyIconVariant } from "@/app/components/icons/CurrencyIcon"
import InfoIcon from "@/app/components/icons/InfoIcon"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"
import { ChainImage } from "@/app/components/images/ChainImage"
import Button from "@/app/components/ui/Button"
import { SelectItemToggle } from "@/app/components/ui/SelectItemToggle"
import { iconSizes } from "@/app/config/styling"
import { DataStatus, UseAddTokenReturnType } from "@/app/hooks/tokens/useAddToken"
import { toShort } from "@/app/lib/strings"
import { SwapStatus } from "@/app/types/swaps"
import { WithRequired } from "@/app/types/utils"

type TextAnimationProps = WithRequired<React.ComponentPropsWithoutRef<typeof motion.div>, "key">
interface CustomTokenInputProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
    useAddTokenData: UseAddTokenReturnType,
    showNotFoundMsg?: boolean,
    textAnimationProps?: TextAnimationProps,
}

interface CustomTokenDetailHeaderProps extends React.ComponentPropsWithoutRef<"div"> {
    label: React.ReactNode,
    labelClass?: string,
    status: DataStatus,
    statusClass?: string,
    textAnimationProps?: TextAnimationProps,
}

interface CustomTokenDetailProps extends React.ComponentPropsWithoutRef<"div"> {
    label?: React.ReactNode,
    labelClass?: string,
    value?: React.ReactNode,
    valueClass?: string,
    emptyValue?: React.ReactNode,
    textAnimationProps?: TextAnimationProps,
}

const TextAnimation = React.forwardRef<React.ComponentRef<typeof motion.div>, TextAnimationProps>(({
    initial = "initial",
    animate = "animate",
    exit = "exit",
    transition = {
        type: "spring",
        duration: 0.2,
    },
    variants = {
        initial: {
            y: "20%",
            opacity: 0,
        },
        animate: {
            y: 0,
            opacity: 1,
        },
        exit: {
            y: "-20%",
            opacity: 0,
        },
    },
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        variants={variants}
        {...props}
    />
))
TextAnimation.displayName = "TextAnimation"

const CustomTokenDetailHeader = React.forwardRef<HTMLDivElement, CustomTokenDetailHeaderProps>(({
    className,
    label,
    labelClass,
    status,
    statusClass,
    textAnimationProps,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-1 justify-between items-center", className)}
        {...props}
    >
        <div className={twMerge("flex flex-row flex-1 justify-start items-center font-bold", labelClass)}>
            {label}
        </div>
        <AnimatePresence mode="wait">
            <TextAnimation
                key={status.msg}
                className={twMerge(
                    "flex flex-row flex-none gap-2 justify-end items-center font-bold text-end",
                    status.isError ? "text-error-500" : status.isSuccess ? "text-success-500" : status.isInProgress ? "text-muted-500" : undefined,
                    statusClass,
                )}
                {...textAnimationProps}
            >
                {status.msg}
                {(status.isInProgress || status.isSuccess || status.isError) && (
                    <SwapStatusIcon
                        className={iconSizes.sm}
                        status={status.isError ? SwapStatus.Error : status.isSuccess ? SwapStatus.Success : SwapStatus.Pending}
                    />
                )}
            </TextAnimation>
        </AnimatePresence>
    </div>
))
CustomTokenDetailHeader.displayName = "CustomTokenDetailHeader"

const CustomTokenDetail = React.forwardRef<HTMLDivElement, CustomTokenDetailProps>(({
    className,
    label,
    labelClass,
    value = "N/A",
    valueClass,
    textAnimationProps,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-1 justify-between items-center", className)}
        {...props}
    >
        <div className={twMerge("flex flex-row flex-none text-muted-400", labelClass)}>
            {label}
        </div>
        <AnimatePresence mode="wait">
            <TextAnimation
                key={value?.toString() ?? "empty"}
                className={twMerge("flex flex-row flex-1 justify-end font-mono font-bold text-base", !value && "text-muted-500", valueClass)}
                {...textAnimationProps}
            >
                {value}
            </TextAnimation>
        </AnimatePresence>
    </div>
))
CustomTokenDetail.displayName = "CustomTokenDetail"

const CustomTokenInput = React.forwardRef<React.ComponentRef<typeof motion.div>, CustomTokenInputProps>(({
    className,
    useAddTokenData,
    showNotFoundMsg = false,
    initial = "hide",
    animate = "show",
    exit = "hide",
    transition = {
        type: "spring",
        duration: 0.5,
    },
    variants = {
        show: {
            x: 0,
            y: 0,
            opacity: 1,
            height: "auto",
        },
        hide: {
            x: "-50%",
            y: "-50%",
            opacity: 0,
            height: 0,
        },
    },
    textAnimationProps,
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        className="overflow-hidden"
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        variants={variants}
        {...props}
    >
        <div className={twMerge("container flex flex-col flex-1 gap-4 p-4", className)}>
            {showNotFoundMsg ? (<>
                <div className="flex flex-row flex-1 justify-start items-center gap-4">
                    <InfoIcon className={iconSizes.default} />
                    <div className="flex flex-row flex-1 justify-start items-center font-bold">
                        Add custom token
                    </div>
                </div>
                <div className="flex flex-row flex-1">
                    No token matching your query was found. Please enter a valid address and confirm the details below if you would like to add a custom token.
                </div>
            </>) : (<>
                <div className="flex flex-row flex-1 justify-start items-center gap-4">
                    <CurrencyIcon
                        className={iconSizes.default}
                        variant={CurrencyIconVariant.UsdCircle}
                    />
                    <div className="flex flex-row flex-1 justify-start items-center font-bold">
                        Add custom token
                    </div>
                </div>
                <div className="flex flex-row flex-1">
                    Please enter a valid address and confirm the details below to add a custom token.
                </div>
            </>)}
            <CustomTokenDetailHeader
                label="Chain"
                status={useAddTokenData.addressStatus}
                textAnimationProps={textAnimationProps}
            />
            <div className="flex flex-row flex-1 flex-wrap gap-2 justify-start items-center">
                {useAddTokenData.allChains.map((chain) => {
                    const hasResult = !!useAddTokenData.tokenQueryResults[chain.id]?.token
                    const isSelected = useAddTokenData.selectedResult && useAddTokenData.selectedResult.chain.id === chain.id
                    return (
                        <SelectItemToggle
                            key={chain.id}
                            className={twMerge("relative container-select px-3 py-2 rounded-lg before:rounded-lg", !hasResult && "grayscale")}
                            replaceClass={true}
                            onClick={hasResult ? useAddTokenData.setSelectedResult.bind(this, !isSelected ? chain : undefined) : undefined}
                            isSelected={isSelected}
                            disabled={!hasResult}
                        >
                            <ChainImage
                                chain={chain}
                                size="xs"
                            />
                            <div className={twMerge("absolute -top-1 -end-1 w-3 h-3 rounded-full", hasResult && "bg-success-500")} />
                        </SelectItemToggle>
                    )
                })}
            </div>
            <CustomTokenDetailHeader
                label="Token details"
                status={useAddTokenData.tokenQueryStatus}
                textAnimationProps={textAnimationProps}
            />
            <div className="flex flex-col flex-1">
                <CustomTokenDetail
                    label="Address"
                    value={useAddTokenData.address && toShort(useAddTokenData.address)}
                    textAnimationProps={textAnimationProps}
                />
                <CustomTokenDetail
                    label="Chain"
                    value={useAddTokenData.selectedResult?.chain.name}
                    textAnimationProps={textAnimationProps}
                />
                <CustomTokenDetail
                    label="Symbol"
                    value={useAddTokenData.selectedResult?.token?.symbol}
                    textAnimationProps={textAnimationProps}
                />
                <CustomTokenDetail
                    label="Name"
                    value={useAddTokenData.selectedResult?.token?.name}
                    textAnimationProps={textAnimationProps}
                />
                <CustomTokenDetail
                    label="Decimals"
                    value={useAddTokenData.selectedResult?.token?.decimals}
                    textAnimationProps={textAnimationProps}
                />
            </div>
            <div className="flex flex-row flex-1 gap-4">
                <Button
                    className="form-btn"
                    replaceClass={true}
                    onClick={useAddTokenData.clearInput.bind(this)}
                >
                    Cancel
                </Button>
                <Button
                    className="form-btn"
                    replaceClass={true}
                    onClick={useAddTokenData.selectedResultStatus.isSuccess ? useAddTokenData.addToken.bind(this) : undefined}
                    data-success={useAddTokenData.selectedResultStatus.isSuccess}
                    disabled={!useAddTokenData.selectedResultStatus.isSuccess}
                >
                    {useAddTokenData.selectedResultStatus.msg}
                    {useAddTokenData.selectedResultStatus.isInProgress && <LoadingIcon className={iconSizes.xs} />}
                </Button>
            </div>
        </div>
    </motion.div>
))
CustomTokenInput.displayName = "CustomTokenInput"

export default CustomTokenInput