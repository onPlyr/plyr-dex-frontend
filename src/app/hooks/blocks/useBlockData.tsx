import { useContext } from "react"

import { BlockDataContext } from "@/app/providers/BlockDataProvider"

const useBlockData = () => {
    return useContext(BlockDataContext)
}

export default useBlockData
