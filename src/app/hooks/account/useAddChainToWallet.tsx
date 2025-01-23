import { useCallback } from "react"
import { addChain } from "viem/actions"
import { serialize, useAccount, useConnectorClient } from "wagmi"

import { Chain } from "@/app/types/chains"

const useAddChainToWallet = () => {

    const { address } = useAccount()
    const enabled = address !== undefined

    const { data: client } = useConnectorClient({
        query: {
            enabled: enabled,
        }
    })

    const addChainToWallet = useCallback(async (chain: Chain) => {
        if (enabled && client) {
            try {
                await addChain(client, {
                    chain: chain,
                })
            }
            catch (err) {
                console.error(`addChainToWallet error: ${serialize(err)}`)
            }
        }
    }, [enabled, client])

    return addChainToWallet
}

export default useAddChainToWallet
