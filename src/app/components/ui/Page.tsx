"use client"

import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useAccountModal, useChainModal, useConnectModal } from "@rainbow-me/rainbowkit"
import React from "react"
import { twMerge } from "tailwind-merge"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import BackIcon from "@/app/components/icons/BackIcon"
import ErrorIcon from "@/app/components/icons/ErrorIcon"
import InfoIcon from "@/app/components/icons/InfoIcon"
import WarningIcon from "@/app/components/icons/WarningIcon"
import Button from "@/app/components/ui/Button"
import ExternalLink from "@/app/components/ui/ExternalLink"
import ScrollArea from "@/app/components/ui/ScrollArea"
import { iconSizes } from "@/app/config/styling"

export interface PageMsgData {
    header: React.ReactNode,
    msg: React.ReactNode,
}

enum PageMsgType {
    Error = "error",
    Warning = "warning",
    Info = "info",
}

interface PageProps extends React.ComponentPropsWithoutRef<"div"> {
    backTab?: string,
    backUrl?: `/${string}`,
    fromTab?: string,
    setTab?: (tab: string, fromTab: string) => void,
    headerIcon?: React.ReactNode,
    header?: React.ReactNode,
    footer?: React.ReactNode,
    error?: PageMsgData,
    warning?: PageMsgData,
    info?: PageMsgData,
}

interface PageHeaderProps extends React.ComponentPropsWithoutRef<"div"> {
    backUrl?: `/${string}`,
    tab?: string,
    fromTab?: string,
    setTab?: (tab: string, fromTab: string) => void,
    icon?: React.ReactNode,
}

interface PageMessageProps extends React.ComponentPropsWithoutRef<typeof ScaleInOut> {
    data: PageMsgData,
    type: PageMsgType,
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(({
    children,
    className,
    backUrl,
    tab,
    fromTab,
    setTab,
    icon,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-1 p-4 gap-4 w-full relative justify-center items-center font-bold", className)}
        {...props}
    >
        {backUrl ? (
            <Link
                className="flex flex-row flex-none w-fit p-2 pe-3 gap-2 items-center absolute start-0 rounded-lg transition text-xs text-muted-400 hover:text-white hover:container-bg"
                href={backUrl}
            >
                {icon ?? <BackIcon className={iconSizes.sm} />}
                Back
            </Link>
        ) : tab && setTab && fromTab ? (
            <Button
                className="clear-bg clear-border-outline flex flex-row flex-none w-fit p-2 pe-3 gap-2 items-center absolute start-0 rounded-lg text-xs text-muted-400 hover:text-white hover:container-bg"
                replaceClass={true}
                onClick={setTab.bind(this, tab, fromTab)}
            >
                {icon ?? <BackIcon className={iconSizes.sm} />}
                Back
            </Button>
        ) : icon && (
            <div className="p-4 absolute start-0">
                {icon}
            </div>
        )}
        {children}
    </div>
))
PageHeader.displayName = "PageHeader"

export const PageFooter = React.forwardRef<React.ComponentRef<typeof ScaleInOut>, React.ComponentPropsWithoutRef<typeof ScaleInOut>>(({
    className,
    ...props
}, ref) => (
    <ScaleInOut
        ref={ref}
        className={twMerge("flex flex-col flex-1 p-4 gap-4 sm:px-0 page-width z-[125]", className)}
        fadeInOut={true}
        {...props}
    />
))
PageFooter.displayName = "PageFooter"

export const PageMessage = React.forwardRef<React.ComponentRef<typeof ScaleInOut>, PageMessageProps>(({
    className,
    data,
    type,
    ...props
}, ref) => {
    const msgClass = type === PageMsgType.Error ? "text-error-500" : type === PageMsgType.Warning ? "text-warning-500" : "text-info-500"
    return (
        <ScaleInOut
            ref={ref}
            fadeInOut={true}
            {...props}
        >
            <div
                className={twMerge("container-select flex flex-row flex-1 p-4 gap-4 page-width items-center", className)}
                data-selected={true}
            >
                {type === PageMsgType.Error ? (
                    <ErrorIcon className={twMerge(msgClass, iconSizes.lg)} />
                ) : type === PageMsgType.Warning ? (
                    <WarningIcon className={twMerge(msgClass, iconSizes.lg)} />
                ) : (
                    <InfoIcon className={twMerge(msgClass, iconSizes.lg)} />
                )}
                <div className="flex flex-col flex-1 gap-1">
                    <div className={twMerge("flex flex-row flex-1 items-center font-bold", msgClass)}>
                        {data.header}
                    </div>
                    <div className={twMerge("flex flex-row flex-1 items-center")}>
                        {data.msg}
                    </div>
                </div>
            </div>
        </ScaleInOut>
    )
})
PageMessage.displayName = "PageMessage"

export const Page = React.forwardRef<HTMLDivElement, PageProps>(({
    children,
    className,
    backTab,
    backUrl,
    fromTab,
    setTab,
    headerIcon,
    header,
    footer,
    error,
    info,
    warning,
    ...props
}, ref) => {

    const { accountModalOpen } = useAccountModal()
    const { chainModalOpen } = useChainModal()
    const { connectModalOpen } = useConnectModal()
    const hideFooter = accountModalOpen || chainModalOpen || connectModalOpen

    return (
        <motion.main className="flex flex-col flex-1 w-full h-full justify-start items-center">
            <ScrollArea>
                <div
                    ref={ref}
                    className={twMerge(
                        "flex flex-col flex-none pt-16 sm:pt-20 w-full min-h-fit max-h-fit h-fit justify-start items-center",
                        footer ? undefined : "pb-4",
                        className,
                    )}
                    {...props}
                >
                    <div className={twMerge("flex flex-col flex-none page-width min-h-fit max-h-fit items-start overflow-auto", header ? undefined : "pt-4")}>
                        <div className="flex flex-col flex-1 px-4 sm:px-0 w-full h-full overflow-hidden">
                            {/* <div className="container-select flex flex-row flex-1 p-4 gap-2 mt-4 sm:mt-0 w-full justify-between" data-selected={true}>
                                <div className="flex flex-row flex-1 flex-wrap">Tesseract is currently in beta and only available on testnet. Funds are not real or transferrable to mainnet.</div>
                                <div className="flex flex-row flex-none items-center">
                                    <ExternalLink
                                        href="https://test.core.app/tools/testnet-faucet/?subnet=c&token=c"
                                        className="gradient-btn px-3 py-2 font-bold text-white hover:text-white"
                                        iconSize="sm"
                                    >
                                        Faucet
                                    </ExternalLink>
                                </div>
                            </div> */}
                            {(header || backUrl || (backTab && setTab && fromTab) || headerIcon) && (
                                <PageHeader
                                    backUrl={backUrl}
                                    tab={backTab}
                                    fromTab={fromTab}
                                    setTab={setTab}
                                    icon={headerIcon}
                                >
                                    {header}
                                </PageHeader>
                            )}
                            {children}
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <AnimatePresence mode="wait">
                {(error || warning || info) && (
                    <div className={twMerge("flex flex-col flex-none p-4 gap-4 sm:px-0 page-width z-[125]", footer ? "pb-0" : undefined)}>
                        {error && (
                            <PageMessage
                                data={error}
                                type={PageMsgType.Error}
                            />
                        )}
                        {warning && (
                            <PageMessage
                                data={warning}
                                type={PageMsgType.Warning}
                            />
                        )}
                        {info && (
                            <PageMessage
                                data={info}
                                type={PageMsgType.Info}
                            />
                        )}
                    </div>
                )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
                {footer && !hideFooter && (
                    <PageFooter>
                        {footer}
                    </PageFooter>
                )}
            </AnimatePresence>
        </motion.main>
    )
})
Page.displayName = "Page"