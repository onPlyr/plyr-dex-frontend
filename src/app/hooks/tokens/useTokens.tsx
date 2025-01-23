import { useContext } from "react"

import { TokenDataContext } from "@/app/providers/TokenDataProvider" 

const useTokens = () => {
    return useContext(TokenDataContext)
}

export default useTokens
