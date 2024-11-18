"use client";
import { createWallet, inAppWallet } from "thirdweb/wallets";

export const wallets = [
    // inAppWallet(),
    createWallet("io.metamask"),
    //createWallet("com.coinbase.wallet"),
    createWallet("walletConnect")
];

export const socialWallets = [
    inAppWallet({
        auth: {
          options: [
           // "email",
           // "phone",
            "passkey",
            "google",
            "apple",
            "facebook",
            'discord',
            'telegram',
          ],
        },
      },),
];