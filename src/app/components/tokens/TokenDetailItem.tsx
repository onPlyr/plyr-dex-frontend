"use client"

import { motion } from "motion/react"
import React, { useMemo } from "react"
import { twMerge } from "tailwind-merge"

import { FavouriteIcon } from "@/app/components/icons/FavouriteIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import TokenAmountValue from "@/app/components/tokens/TokenAmountValue"
import TokenBalance from "@/app/components/tokens/TokenBalance"
import { SelectItem } from "@/app/components/ui/SelectItem"
import { Bold } from "@/app/components/ui/Typography"
import { imgSizes } from "@/app/config/styling"
import useTokens from "@/app/hooks/tokens/useTokens"
import { getChain } from "@/app/lib/chains"
import { isValidTokenAmount, Token } from "@/app/types/tokens"

interface RequiredAnimationProps {
    index: number,
    numTokens: number,
}

interface TokenDetailAnimationProps extends React.ComponentPropsWithoutRef<typeof motion.div>, RequiredAnimationProps {
    delay?: number,
}

interface TokenDetailItemProps extends React.ComponentPropsWithoutRef<typeof SelectItem> {
    token: Token,
}

export const TokenDetailAnimation = React.forwardRef<React.ComponentRef<typeof motion.div>, TokenDetailAnimationProps>(({
    className,
    delay = 0.025,
    index,
    numTokens,
    initial = "initial",
    animate = "animate",
    exit = "exit",
    layout = true,
    transition = {
        type: "spring",
        duration: 0.5,
    },
    variants = {
        initial: {
            // x: "-50%",
            x: -300,
            opacity: 0,
            scale: 0,
            height: 0,
            transition: {
                ...transition,
                delay: (numTokens - index - 1) * delay,
            },
        },
        animate: {
            x: 0,
            opacity: 1,
            scale: 1,
            height: "auto",
            transition: {
                ...transition,
                delay: index * delay,
            },
        },
        exit: {
            // x: "50%",
            x: 300,
            opacity: 0,
            scale: 0,
            height: 0,
            transition: {
                ...transition,
                delay: (numTokens - index - 1) * delay,
            },
        },
    },
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        className={twMerge("overflow-hidden", className)}
        layout={layout}
        layoutDependency={index}
        initial={initial}
        animate={animate}
        exit={exit}
        variants={variants}
        {...props}
    />
))
TokenDetailAnimation.displayName = "TokenDetailAnimation"

const TokenDetailItem = React.forwardRef<React.ComponentRef<typeof SelectItem>, TokenDetailItemProps>(({
    token,
    ...props
}, ref) => {

    const chain = getChain(token.chainId)
    const { useBalancesData, getIsFavouriteToken, setIsFavouriteToken } = useTokens()
    const { getBalance } = useBalancesData

    const isFavourite = useMemo(() => getIsFavouriteToken(token), [token, getIsFavouriteToken])
    const balance = useMemo(() => getBalance(token), [token, getBalance])
    const showBalance = useMemo(() => Boolean(balance && isValidTokenAmount(balance) && balance.amount), [balance])

    const favouriteIcon = <FavouriteIcon
        className={twMerge("transition", isFavourite ? "text-brand-500 hover:text-brand-400" : "text-muted-500 hover:text-muted-300")}
        isFavourite={isFavourite}
        onClick={(e) => {
            setIsFavouriteToken(token)
            e.stopPropagation()
        }}
    />

    return (
        <SelectItem
            ref={ref}
            {...props}
        >
            <div className="flex flex-row flex-1 gap-4 w-full items-center">
                <TokenImage token={token} />
                <div className="flex flex-col flex-1 w-full overflow-hidden">
                    <div className="flex flex-row flex-1 gap-2 justify-between items-center">
                        <Bold>{token.symbol}</Bold>
                        <span className="hidden sm:inline w-full text-muted-500 truncate">{token.name}</span>
                        {showBalance && (
                            <TokenBalance
                                className="flex flex-row flex-none justify-end items-center font-mono text-base text-end"
                                token={token}
                                balance={balance}
                                hideSymbol={true}
                            />
                        )}
                    </div>
                    <div className="flex flex-row flex-1 gap-2 justify-between items-center">
                        {chain && (
                            <div className="flex flex-row flex-1 gap-2 justify-start items-center overflow-hidden">
                                <ChainImageInline
                                    chain={chain}
                                    className={imgSizes.xs}
                                />
                                <span className="text-muted-400 truncate">{chain.name}</span>
                            </div>
                        )}
                        {showBalance && (
                            <TokenAmountValue
                                className="flex flex-row flex-none justify-end items-center text-end text-muted-500"
                                token={token}
                                amount={balance}
                            />
                        )}
                    </div>
                </div>
                {favouriteIcon}
            </div>
        </SelectItem>
    )
})
TokenDetailItem.displayName = "TokenDetailItem"

export default TokenDetailItem