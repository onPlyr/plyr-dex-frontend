import { useContext } from "react"

import { FavouriteTokensContext } from "@/app/lib/tokens" 

const useFavouriteTokens = () => {
    return useContext(FavouriteTokensContext)
}

export default useFavouriteTokens
