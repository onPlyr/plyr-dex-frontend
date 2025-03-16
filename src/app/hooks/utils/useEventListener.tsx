import { useIsomorphicLayoutEffect } from "motion/react"
import { RefObject, useEffect, useRef } from "react"

const useEventListener = <
    KWindow extends keyof WindowEventMap,
    KHTML extends keyof HTMLElementEventMap,
    KSVG extends keyof SVGElementEventMap,
    KMediaQuery extends keyof MediaQueryListEventMap,
    KDocument extends keyof DocumentEventMap,
    TEventType extends
        | WindowEventMap[KWindow]
        | HTMLElementEventMap[KHTML]
        | SVGElementEventMap[KSVG]
        | MediaQueryListEventMap[KMediaQuery]
        | DocumentEventMap[KDocument]
        | Event,
    TElement extends HTMLElement | SVGAElement | MediaQueryList | Document = HTMLElement,
>(
    eventName: KWindow | KHTML | KSVG | KMediaQuery | KDocument,
    handler: (event: TEventType) => void,
    element?: RefObject<TElement> | Document,
    options?: boolean | AddEventListenerOptions,
) => {

    const savedHandler = useRef(handler)
    useIsomorphicLayoutEffect(() => {
        savedHandler.current = handler
    }, [handler])

    useEffect(() => {

        const targetElement: TElement | Document | Window = element instanceof Document ? element : element?.current ?? window
        if (!targetElement || !targetElement.addEventListener) {
            return
        }

        const eventListener = (event: TEventType) => {
            savedHandler.current(event)
        }

        targetElement.addEventListener(eventName, eventListener as EventListener, options)
        return () => {
            targetElement.removeEventListener(eventName, eventListener as EventListener, options)
        }

    }, [eventName, element, options])
}

export default useEventListener
