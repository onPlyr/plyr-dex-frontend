"use client"

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export default function NProgress() {
    return (
        <ProgressBar
            height="4px"
            color="#ff6600"
            options={{ showSpinner: false }}
            shallowRouting
        />
    )
}