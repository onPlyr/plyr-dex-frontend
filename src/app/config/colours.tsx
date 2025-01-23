import { tailwindCustomColours } from "@/tailwind.config"

import { ColourDefinition } from "@/app/types/styling"

export const customColours: Record<string, ColourDefinition> = {
    brandLightBlue: tailwindCustomColours.brandLightBlue as ColourDefinition,
    brandDarkBlue: tailwindCustomColours.brandDarkBlue as ColourDefinition,
    brandPink: tailwindCustomColours.brandPink as ColourDefinition,
    brandPurple: tailwindCustomColours.brandPurple as ColourDefinition,
    brandDarkPurple: tailwindCustomColours.brandDarkPurple as ColourDefinition,
    darkZinc: tailwindCustomColours.darkZinc as ColourDefinition,
}
