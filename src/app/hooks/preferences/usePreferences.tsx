import { useContext } from "react"

import { PreferencesContext } from "@/app/lib/preferences"

const usePreferences = () => {
    return useContext(PreferencesContext)
}

export default usePreferences
