"use client";
import { ConnectButton, darkTheme, useActiveAccount } from "thirdweb/react";
import { client, phiChain, tauChain } from "@/lib/thirdweb_client";
import { wallets } from "@/config/wallet";
import { useEffect, useState } from "react";

export default function WalletButton() {

    const activeAccount = useActiveAccount();

    const [finalData, setFinalData] = useState<any>({});
    const checkExistedAddress = async () => {
        try {

            // Read from local storage with expiration time
            const localData = localStorage.getItem('plyrswapBasicInfo-' + activeAccount?.address.toLowerCase());
            if (localData) {
                const localDataObj = JSON.parse(localData);
                if (localDataObj.expiryTime > new Date().getTime()) {
                    console.log('localDataObj', localDataObj);
                    setFinalData(localDataObj);
                    return;
                }
            }

            const response = await fetch('https://api.plyr.network/api/user/basic/' + activeAccount?.address, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const retJson = await response.json();
            if (response.status !== 200) {
                setFinalData({});
            }
            else {
                setFinalData(retJson);
                //console.log('retJson', retJson);
                const expiryTime = new Date().getTime() + 1000 * 60 * 60 * 24; // 1 day
                localStorage.setItem('plyrswapBasicInfo-' + activeAccount?.address.toLowerCase(), JSON.stringify({...retJson, expiryTime: expiryTime}));
            }
        }
        catch (error) {
            setFinalData({});
        }
    }

    useEffect(() => {
        if (activeAccount) {
            checkExistedAddress();
        }
    }, [activeAccount]);

    return <ConnectButton
        autoConnect={false}
        client={client}
        wallets={wallets} 
        // Remove chain prop if reqChain is undefined
        //chain={reqChain ? reqChain : null}
        walletConnect={
            {
                projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID
            }
        }
        showAllWallets={true}

        // onConnect={(wallet) => {
        //     console.log("onConnect", wallet)
        // }}
        
        theme={darkTheme({
            colors: {
                accentText: "#ff6600",
                accentButtonBg: "#ff6600",
                primaryButtonBg: "#000000",
                primaryButtonText: "#ffffff",
                skeletonBg: "#fdfcfd",
                selectedTextColor: "#fdfcfd",
                selectedTextBg: "#fdfcfd",
            },
        })}
        connectButton={{
            label: "CONNECT",
            className: "ThirdwebWalletBtn"
        }}
        connectModal={{
            size: "compact",
            title: "Choose your Wallet",
            titleIcon: "https://plyr.network/logo/plyr_icon_orange.svg",
            showThirdwebBranding: false,
            
        }}
        detailsButton={{
            className: "ThirdwebWalletBtn",
            connectedAccountName: Object.keys(finalData).length > 0 ? finalData?.plyrId?.toUpperCase() : undefined,
            connectedAccountAvatarUrl: Object.keys(finalData).length > 0 && finalData?.avatar ? finalData?.avatar.replace('ipfs://', 'https://ipfs.plyr.network/ipfs/') + '?img-width=70' : '/plyrswap.svg',
        }}
        detailsModal={{
            showTestnetFaucet: true,
            connectedAccountName: Object.keys(finalData).length > 0 ? finalData?.plyrId?.toUpperCase() : undefined,
            connectedAccountAvatarUrl: Object.keys(finalData).length > 0 && finalData?.avatar ? finalData?.avatar.replace('ipfs://', 'https://ipfs.plyr.network/ipfs/') + '?img-width=70' : '/plyrswap.svg',
        }}
        switchButton={{
            className: "ThirdwebWalletBtn",
        }}

    />
}