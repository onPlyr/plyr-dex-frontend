import { useContext } from "react"

import { AccountDataContext } from "@/app/lib/account"

const useAccountHistory = () => {
    const { history } = useContext(AccountDataContext)
    return history
}

export default useAccountHistory
