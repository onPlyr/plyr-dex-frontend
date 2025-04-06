"use client"

import "@/app/styles/globals.css"

import { AnimatePresence, motion, Transition } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect } from "react"
import { twMerge } from "tailwind-merge"

import AccountIcon from "@/app/components/icons/AccountIcon"
import HistoryIcon from "@/app/components/icons/HistoryIcon"
import { SettingsIcon } from "@/app/components/icons/SettingsIcon"
import SocialIcon from "@/app/components/icons/SocialIcon"
import SwapButton from "@/app/components/swap/SwapButton"
import SwapWidget from "@/app/components/swap/SwapWidget"
import SwapQuoteExpiryTimer from "@/app/components/swapQuotes/SwapQuoteExpiryTimer"
import Button from "@/app/components/ui/Button"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { Page } from "@/app/components/ui/Page"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { iconSizes } from "@/app/config/styling"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import useSessionStorage from "@/app/hooks/utils/useSessionStorage"
import { PageType, SocialLink } from "@/app/types/navigation"
import { NotificationStatus, NotificationType } from "@/app/types/notifications"
import { StorageKey } from "@/app/types/storage"

const defaultIntroTransition: Transition = {
    type: "spring",
    duration: 1,
} as const

const SwapPage = () => {

    const router = useRouter()
    const searchParams = useSearchParams()
    const isShowIntro = !!searchParams.get("intro")?.trim()
    const [showIntro, setShowIntro] = useSessionStorage({
        key: StorageKey.ShowIntro,
        initialValue: isShowIntro,
    })

    useEffect(() => {
        if (isShowIntro) {
            setShowIntro(true)
            router.replace("/swap")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isShowIntro])

    const { useSwapQuotesData: { error: quotesError } } = useQuoteData()
    const { setNotification } = useNotifications()

    useEffect(() => {
        if (quotesError) {
            setNotification({
                id: quotesError,
                type: NotificationType.Error,
                header: `Error Fetching Quotes`,
                body: quotesError,
                status: NotificationStatus.Error,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quotesError])

    const pageHeader = <div className="flex flex-row flex-1 gap-4 justify-between items-center">
        <div className="text-white text-4xl font-black leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>SWAP</div>
        <div className="flex flex-row gap-4">
            <Tooltip
                trigger=<Button
                    label="My Account"
                    className="icon-btn transition hover:rotate-[360deg]"
                    replaceClass={true}
                >
                    <Link href="/account">
                        <AccountIcon className={iconSizes.sm} />
                    </Link>
                </Button>
            >
                My Account
            </Tooltip>
            <Tooltip
                trigger=<Button
                    label="My Transactions"
                    className="icon-btn transition hover:-rotate-[360deg]"
                    replaceClass={true}
                >
                    <Link href="/swap/history">
                        <HistoryIcon className={iconSizes.sm} />
                    </Link>
                </Button>
            >
                My Transactions
            </Tooltip>
            <Tooltip
                trigger=<Button
                    label="My Preferences"
                    className="icon-btn transition hover:rotate-90"
                    replaceClass={true}
                >
                    <Link href="/preferences">
                        <SettingsIcon className={iconSizes.sm} />
                    </Link>
                </Button>
            >
                My Preferences
            </Tooltip>
            <SwapQuoteExpiryTimer />
        </div>
    </div>

    return (
        <Page
            key={PageType.Swap}
            hideNetworkMsg={true}
            pageWidth="max-w-screen-lg w-full"
            isContainerPage={true}
        >
            <div className="flex flex-col flex-none w-full h-fit">
                <div className="relative flex flex-row flex-none justify-center overflow-hidden">
                    <motion.div
                        className={twMerge("relative flex flex-col flex-1 w-full h-full", showIntro ? "cursor-pointer" : undefined)}
                        initial={showIntro ? "showIntro" : "initial"}
                        animate={showIntro ? "showIntro" : "initial"}
                        exit="initial"
                        transition={defaultIntroTransition}
                        whileHover={showIntro ? "hover" : undefined}
                        whileTap={showIntro ? "hover" : undefined}
                        whileFocus={showIntro ? "hover" : undefined}
                        variants={{
                            initial: {
                                paddingTop: 0,
                                paddingBottom: 0,
                            },
                            showIntro: {
                                paddingTop: "10%",
                                paddingBottom: 0,
                            },
                            hover: {
                                paddingTop: "7.5%",
                                paddingBottom: "2.5%",
                            },
                        }}
                        onClick={showIntro ? setShowIntro.bind(this, false) : undefined}
                    >
                        <AnimatePresence mode="wait">
                            {showIntro && (
                                <motion.div
                                    className="z-[50] flex flex-col flex-1 w-full h-full absolute start-0 top-0"
                                    transition={{
                                        type: "tween",
                                        ease: "easeOut",
                                        duration: defaultIntroTransition.duration * 0.75,
                                    }}
                                    variants={{
                                        initial: {
                                            backdropFilter: "blur(0px)",
                                        },
                                        showIntro: {
                                            backdropFilter: "blur(4px)",
                                        },
                                        hover: {
                                            backdropFilter: "blur(0px)",
                                            transition: {
                                                type: "tween",
                                                ease: "easeOut",
                                                duration: defaultIntroTransition.duration * 0.5,
                                            },
                                        },
                                    }}
                                />
                            )}
                        </AnimatePresence>
                        <motion.div
                            transition={defaultIntroTransition}
                            variants={{
                                initial: {
                                    scale: 1,
                                },
                                showIntro: {
                                    scale: 0.9,
                                },
                                hover: {
                                    scale: 1,
                                },
                            }}
                        >
                            <Page
                                key={PageType.Swap}
                                header={pageHeader}
                                footer={!showIntro && <SwapButton />}
                                hideNetworkMsg={showIntro}
                                isNestedPage={true}
                            >
                                <SwapWidget isShowIntro={isShowIntro} />
                            </Page>
                        </motion.div>
                    </motion.div>
                </div>
                <AnimatePresence mode="wait">
                    {showIntro && (
                        <motion.div
                            initial="initial"
                            animate="showIntro"
                            exit="initial"
                            transition={defaultIntroTransition}
                            variants={{
                                initial: {
                                    y: "25%",
                                    opacity: 0,
                                    scale: 0.8,
                                },
                                showIntro: {
                                    y: 0,
                                    opacity: 1,
                                    scale: 1,
                                },
                            }}
                        >
                            <div className="flex flex-col flex-1 p-4 my-4 gap-4">
                                <div className="flex flex-row flex-1 justify-center font-bold text-center text-3xl">
                                    {"Avalanche's Liquidity Marketplace"}
                                </div>
                                <div className="flex flex-row flex-1 justify-center font-bold text-center text-muted-500">
                                    <div className="page-width">{"Move & Swap Any Asset Instantly: Tapping Every Avalanche Liquidity Source."}</div>
                                </div>
                                <div className="flex flex-row flex-1 gap-4 justify-center items-center">
                                    <Button
                                        className="gradient-btn"
                                        onClick={setShowIntro.bind(this, false)}
                                        isAnimated={true}
                                    >
                                        Start Swapping
                                    </Button>
                                </div>

                                <div className="flex flex-row flex-1 flex-wrap gap-4 justify-center items-center">
                                    {Object.entries(SocialLink).map(([type, data]) => (
                                        <ExternalLink
                                            key={type}
                                            href={data.href}
                                            className="contents"
                                            replaceClass={true}
                                            hideIcon={true}
                                        >
                                            <motion.div
                                                className="flex flex-row flex-none justify-center items-center rounded-full bg-white text-black"
                                                initial="initial"
                                                whileHover="hover"
                                                whileTap="hover"
                                                whileFocus="hover"
                                                transition={{
                                                    type: "spring",
                                                    duration: 0.5,
                                                }}
                                                variants={{
                                                    initial: {
                                                        gap: 0,
                                                        padding: "0.75rem",
                                                        paddingRight: "0.75rem",
                                                    },
                                                    hover: {
                                                        gap: "0.75rem",
                                                        paddingRight: "1.25rem",
                                                    },
                                                }}
                                            >
                                                <SocialIcon
                                                    socialData={data}
                                                    iconSize="lg"
                                                />
                                                <motion.div
                                                    className="font-bold text-nowrap"
                                                    transition={{
                                                        type: "spring",
                                                        duration: 0.5,
                                                    }}
                                                    variants={{
                                                        initial: {
                                                            opacity: 0,
                                                            scale: 0,
                                                            width: 0,
                                                        },
                                                        hover: {
                                                            opacity: 1,
                                                            scale: 1,
                                                            width: "auto",
                                                        },
                                                    }}
                                                >
                                                    {data.name}
                                                </motion.div>
                                            </motion.div>
                                        </ExternalLink>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Page>
    )
}

export default SwapPage