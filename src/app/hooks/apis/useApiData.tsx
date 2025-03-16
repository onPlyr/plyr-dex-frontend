import { useContext } from "react"

import { ApiDataContext } from "@/app/providers/ApiDataProvider"

const useApiData = () => {
    return useContext(ApiDataContext)
}

export default useApiData
