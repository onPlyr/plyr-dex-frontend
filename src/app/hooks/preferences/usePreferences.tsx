import { useContext } from "react"

import { PreferencesContext } from "@/app/providers/PreferencesProvider"

const usePreferences = () => {
    return useContext(PreferencesContext)
}

export default usePreferences
