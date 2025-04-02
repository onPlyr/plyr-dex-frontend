"use client"

import { motion } from "motion/react"
import React from "react"
import { twMerge } from "tailwind-merge"

import { FavouriteIcon } from "@/app/components/icons/FavouriteIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import TokenAmountValue from "@/app/components/tokens/TokenAmountValue"
import TokenBalance from "@/app/components/tokens/TokenBalance"
import { SelectItem } from "@/app/components/ui/SelectItem"
import { imgSizes } from "@/app/config/styling"
import useTokens from "@/app/hooks/tokens/useTokens"
import { getChain } from "@/app/lib/chains"
import { Token } from "@/app/types/tokens"

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
            x: "-50%",
            opacity: 0,
            scale: 0,
            height: 0,
        },
        animate: {
            x: 0,
            opacity: 1,
            scale: 1,
            height: "auto",
        },
        exit: {
            x: "50%",
            opacity: 0,
            scale: 0,
            height: 0,
        },
    },
    delay = 0.025,
    index,
    numTokens,
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        className="overflow-hidden"
        layout={layout}
        layoutDependency={index}
        initial={initial}
        animate={animate}
        exit={exit}
        variants={{
            ...variants,
            initial: {
                ...variants.initial,
                transition: {
                    ...transition,
                    delay: (numTokens - index - 1) * delay,
                },
            },
            animate: {
                ...variants.animate,
                transition: {
                    ...transition,
                    delay: index * delay,
                },
            },
            exit: {
                ...variants.exit,
                transition: {
                    ...transition,
                    delay: (numTokens - index - 1) * delay,
                },
            },
        }}
        {...props}
    />
))
TokenDetailAnimation.displayName = "TokenDetailAnimation"

const TokenDetailItem = React.forwardRef<React.ComponentRef<typeof SelectItem>, TokenDetailItemProps>(({
    token,
    ...props
}, ref) => {

    const chain = getChain(token.chainId)
    const { useBalancesData: { getBalance }, getIsFavouriteToken, setIsFavouriteToken } = useTokens()
    const balance = getBalance(token)
    const isFavourite = getIsFavouriteToken(token)

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
            <div className="flex flex-col sm:flex-row flex-1 gap-x-4 gap-y-2">
                <div className="flex flex-row flex-1 gap-4">
                    <div className="flex flex-col flex-none justify-center items-center">
                        <TokenImage token={token} />
                    </div>
                    <div className="flex flex-col flex-1">
                        <div className="flex flex-row flex-1 gap-2 items-end">
                            <div className="font-bold">
                                {token.symbol}
                            </div>
                            <div className="hidden md:flex text-muted-500">
                                {token.name}
                            </div>
                        </div>
                        {chain && (
                            <div className="flex flex-row flex-1 gap-2 items-center text-muted-400">
                                <ChainImageInline
                                    chain={chain}
                                    className={imgSizes.xs}
                                />
                                {chain.name}
                            </div>
                        )}
                    </div>
                    <div className="flex sm:hidden flex-row flex-none justify-center items-center">
                        {favouriteIcon}
                    </div>
                </div>
                <div className="flex flex-row sm:flex-col flex-1 justify-center items-end">
                    <TokenBalance
                        className="text-end"
                        token={token}
                        balance={balance}
                    />
                    <div className="flex flex-row flex-1 h-full justify-end sm:justify-start items-center sm:items-end text-muted-500 text-end">
                        <TokenAmountValue
                            token={token}
                            amount={balance}
                        />
                    </div>
                </div>
                <div className="hidden sm:flex flex-row flex-none justify-center items-center">
                    {favouriteIcon}
                </div>
            </div>
        </SelectItem>
    )
})
TokenDetailItem.displayName = "TokenDetailItem"

export default TokenDetailItem
