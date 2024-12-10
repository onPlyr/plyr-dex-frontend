import {
    NumberCircleEight, NumberCircleFive, NumberCircleFour, NumberCircleNine, NumberCircleOne, NumberCircleSeven, NumberCircleSix, NumberCircleThree, NumberCircleTwo, NumberCircleZero, NumberEight, NumberFive, NumberFour,
    NumberNine, NumberOne, NumberSeven, NumberSix, NumberSquareEight,NumberSquareFive, NumberSquareFour, NumberSquareNine, NumberSquareOne, NumberSquareSeven, NumberSquareSix, NumberSquareThree, NumberSquareTwo,
    NumberSquareZero, NumberThree, NumberTwo, NumberZero
} from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"
import { StyleShape } from "@/app/types/styling"

interface NumberIconProps extends BaseIconProps {
    number: number,
}

const numberShapeIcons: Record<StyleShape, Record<number, React.ReactNode>> = {
    [StyleShape.Circle]: {
        1: <NumberCircleOne />,
        2: <NumberCircleTwo />,
        3: <NumberCircleThree />,
        4: <NumberCircleFour />,
        5: <NumberCircleFive />,
        6: <NumberCircleSix />,
        7: <NumberCircleSeven />,
        8: <NumberCircleEight />,
        9: <NumberCircleNine />,
        0: <NumberCircleZero />,
    },
    [StyleShape.Square]: {
        1: <NumberSquareOne />,
        2: <NumberSquareTwo />,
        3: <NumberSquareThree />,
        4: <NumberSquareFour />,
        5: <NumberSquareFive />,
        6: <NumberSquareSix />,
        7: <NumberSquareSeven />,
        8: <NumberSquareEight />,
        9: <NumberSquareNine />,
        0: <NumberSquareZero />,
    },
}

const numberIcons: Record<number, React.ReactNode> = {
    1: <NumberOne />,
    2: <NumberTwo />,
    3: <NumberThree />,
    4: <NumberFour />,
    5: <NumberFive />,
    6: <NumberSix />,
    7: <NumberSeven />,
    8: <NumberEight />,
    9: <NumberNine />,
    0: <NumberZero />,
}

const NumberIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, NumberIconProps>(({
    children,
    shape,
    number,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? (shape ? numberShapeIcons[shape][number] : numberIcons[number])}
        </BaseIcon>
    )

})
NumberIcon.displayName = "NumberIcon"

export default NumberIcon
