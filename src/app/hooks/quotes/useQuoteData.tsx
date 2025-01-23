import { useContext } from "react"

import { QuoteDataContext } from "@/app/providers/QuoteDataProvider"

const useQuoteData = () => {
    return useContext(QuoteDataContext)
}

export default useQuoteData
