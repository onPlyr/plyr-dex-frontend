"use client"

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit"
import { useCallback, useState } from "react"
import { useAccount, useDisconnect } from "wagmi"

import AccountMenuItem from "@/app/components/account/AccountMenuItem"
import ConnectButton from "@/app/components/account/ConnectButton"
import AccountIcon from "@/app/components/icons/AccountIcon"
import DisconnectIcon from "@/app/components/icons/DisconnectIcon"
import InfoIcon from "@/app/components/icons/InfoIcon"
import MenuIcon from "@/app/components/icons/MenuIcon"
import { SettingsIcon } from "@/app/components/icons/SettingsIcon"
import { TxIcon } from "@/app/components/icons/TxIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import Button from "@/app/components/ui/Button"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import ExternalLink from "@/app/components/ui/ExternalLink"
import Popover from "@/app/components/ui/Popover"
import { socialLinks } from "@/app/config/navigation"
import { NumberFormatType } from "@/app/config/numbers"
import { iconSizes } from "@/app/config/styling"
import useReadAvvyName from "@/app/hooks/avvy/useReadAvvyName"
import useTokens from "@/app/hooks/tokens/useTokens"
import { getBlockExplorerLink, getChain } from "@/app/lib/chains"
import { toShort } from "@/app/lib/strings"
import { getNativeToken } from "@/app/lib/tokens"

const AccountDetailButton = () => {

    const { address: accountAddress, chainId: connectedChainId } = useAccount()
    const { formattedName: avvyName } = useReadAvvyName({
        accountAddress: accountAddress,
    })
    const { disconnect } = useDisconnect()

    const connectedChain = connectedChainId ? getChain(connectedChainId) : undefined
    const nativeToken = connectedChain ? getNativeToken(connectedChain) : undefined
    const { getTokenData } = useTokens()
    const nativeData = getTokenData(nativeToken?.id, connectedChain?.id)
    const shortAddress = accountAddress ? toShort(accountAddress) : undefined
    const explorerUrl = getBlockExplorerLink({
        chain: connectedChain,
        address: accountAddress,
    })

    const [menuOpen, setMenuOpenState] = useState<boolean>(false)
    const setMenuOpen = useCallback((open: boolean) => {
        setMenuOpenState(open)
    }, [setMenuOpenState])

    const numItems = 4 + socialLinks.length

    const onClickMenu = useCallback(() => {
        setMenuOpen(false)
    }, [setMenuOpen])

    return (
        <RainbowConnectButton.Custom>
            {({ account, chain, mounted }) => {
                const rainbowKitChain = chain
                const connected = mounted && account !== undefined && rainbowKitChain !== undefined && accountAddress !== undefined
                return (
                    <div className={mounted ? "contents" : "hidden"}>
                        {!connected ? (
                             <ConnectButton />
                        ) : (
                            // <Popover
                            //     open={menuOpen}
                            //     onOpenChange={setMenuOpen}
                            //     trigger=<div className="btn gradient-btn px-3 py-2 gap-2">
                            //         {avvyName ?? account.displayName}
                            //         <MenuIcon className={iconSizes.xs} />
                            //     </div>
                            //     contentProps={{
                            //         side: "bottom",
                            //     }}
                            // >
                            //     <AccountMenuItem
                            //         icon={connectedChain ? <ChainImageInline chain={connectedChain} size="xs" /> : <InfoIcon className={iconSizes.sm} />}
                            //         idx={0}
                            //         numItems={numItems}
                            //     >
                            //         <div className="flex flex-col flex-1">
                            //             <div className="flex flex-row flex-1 font-bold">
                            //                 {explorerUrl ? (
                            //                     <ExternalLink
                            //                         href={explorerUrl}
                            //                         iconSize="xs"
                            //                         className="text-white"
                            //                     >
                            //                         {shortAddress}
                            //                     </ExternalLink>
                            //                 ) : shortAddress}
                            //             </div>
                            //             <div className="flex flex-row flex-1 font-mono font-bold text-muted-500">
                            //                 {nativeData?.balance ? (
                            //                     <DecimalAmount
                            //                         amount={nativeData.balance}
                            //                         symbol={nativeData.symbol}
                            //                         token={nativeToken}
                            //                         type={NumberFormatType.Precise}
                            //                     />
                            //                 ) : account.displayBalance}
                            //             </div>
                            //         </div>
                            //         <div className="flex flex-row flex-none justify-center items-center">
                            //             <Button
                            //                 label="Disconnect"
                            //                 className="icon-btn text-muted-500 hover:text-white"
                            //                 replaceClass={true}
                            //                 onClick={() => disconnect.bind(this)}
                            //             >
                            //                 <DisconnectIcon className={iconSizes.sm} />
                            //             </Button>
                            //         </div>
                            //     </AccountMenuItem>
                            //     <AccountMenuItem
                            //         icon=<AccountIcon className={iconSizes.sm} />
                            //         onClick={onClickMenu.bind(this)}
                            //         url="/account"
                            //         idx={1}
                            //         numItems={numItems}
                            //     >
                            //         My Account
                            //     </AccountMenuItem>
                            //     <AccountMenuItem
                            //         icon=<TxIcon className={iconSizes.sm} />
                            //         onClick={onClickMenu.bind(this)}
                            //         url="/swap/history"
                            //         idx={2}
                            //         numItems={numItems}
                            //     >
                            //         My Transactions
                            //     </AccountMenuItem>
                            //     <AccountMenuItem
                            //         icon=<SettingsIcon className={iconSizes.sm} />
                            //         onClick={onClickMenu.bind(this)}
                            //         url="/preferences"
                            //         idx={3}
                            //         numItems={numItems}
                            //     >
                            //         My Preferences
                            //     </AccountMenuItem>
                            //     {socialLinks.map((link, i) => (
                            //         <AccountMenuItem
                            //             key={link.id}
                            //             icon=<div className={iconSizes.sm}>
                            //                 {link.icon}
                            //             </div>
                            //             onClick={onClickMenu.bind(this)}
                            //             externalUrl={link.href}
                            //             idx={4 + i}
                            //             numItems={numItems}
                            //         >
                            //             {link.name}
                            //         </AccountMenuItem>
                            //     ))}
                            // </Popover>
                            <></>
                        )}
                    </div>
                )
            }}
        </RainbowConnectButton.Custom>
    )
}

export default AccountDetailButton
