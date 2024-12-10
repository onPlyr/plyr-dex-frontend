import { useContext } from "react"

import { AccountDataContext } from "@/app/lib/account"

const useAccountData = () => {
    return useContext(AccountDataContext)
}

export default useAccountData
