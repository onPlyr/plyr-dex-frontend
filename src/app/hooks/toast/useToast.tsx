// note: taken from shadcn implementation - https://ui.shadcn.com/docs/components/toast

// Inspired by react-hot-toast library
import * as React from "react"

import { ToastProps } from "@/app/components/ui/Toast"
import { ToastAction, toastLimit, toastRemoveDelayMs } from "@/app/config/toast"

type ToasterToast = ToastProps & {
    id: string,
}

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_VALUE
    return count.toString()
}

type Action = {
    type: ToastAction.Add,
    toast: ToasterToast,
} | {
    type: ToastAction.Update,
    toast: Partial<ToasterToast>
} | {
    type: ToastAction.Dismiss,
    toastId?: ToasterToast["id"]
} | {
    type: ToastAction.Remove,
    toastId?: ToasterToast["id"]
}

interface State {
    toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
    if (toastTimeouts.has(toastId)) {
        return
    }

    const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId)
        dispatch({
            type: ToastAction.Remove,
            toastId: toastId,
        })
    }, toastRemoveDelayMs)

    toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case ToastAction.Add:
            return {
                ...state,
                toasts: [action.toast, ...state.toasts].slice(0, toastLimit),
            }

        case ToastAction.Update:
            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t
                ),
            }

        case ToastAction.Dismiss: {
            const { toastId } = action

            // ! Side effects ! - This could be extracted into a dismissToast() action,
            // but I'll keep it here for simplicity
            if (toastId) {
                addToRemoveQueue(toastId)
            } else {
                state.toasts.forEach((toast) => {
                    addToRemoveQueue(toast.id)
                })
            }

            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === toastId || toastId === undefined
                    ? {
                        ...t,
                        open: false,
                        }
                    : t
                ),
            }
        }

        case ToastAction.Remove:
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: [],
                }
            }
            return {
                ...state,
                toasts: state.toasts.filter((t) => t.id !== action.toastId),
            }
    }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
    memoryState = reducer(memoryState, action)
    listeners.forEach((listener) => {
        listener(memoryState)
    })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
    const id = genId()

    const update = (props: ToasterToast) =>
        dispatch({
            type: ToastAction.Update,
            toast: { ...props, id },
        })
    const dismiss = () => dispatch({ type: ToastAction.Dismiss, toastId: id })

    dispatch({
        type: ToastAction.Add,
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open: boolean) => {
                if (!open) dismiss()
            },
        },
    })

    return {
        id: id,
        dismiss,
        update,
    }
}

function useToast() {
    const [state, setState] = React.useState<State>(memoryState)

    React.useEffect(() => {
        listeners.push(setState)
        return () => {
            const index = listeners.indexOf(setState)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [state])

    return {
        ...state,
        toast,
        dismiss: (toastId?: string) => dispatch({ type: ToastAction.Dismiss, toastId }),
    }
}

export { useToast, toast }
