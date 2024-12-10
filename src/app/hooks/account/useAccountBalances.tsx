import { useContext } from "react"

import { AccountDataContext } from "@/app/lib/account"

const useAccountBalances = () => {
    const { balances } = useContext(AccountDataContext)
    return balances
}

export default useAccountBalances
