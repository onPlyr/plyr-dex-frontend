"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DivType, EasingType, InteractivityDetect, type ISourceOptions, LimitMode, MoveDirection, OutMode } from "@tsparticles/engine"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"

import { customColours } from "@/app/config/colours"

const BackgroundParticles = ({
    disabled = false,
}: {
    disabled?: boolean,
}) => {

    const [init, setInit] = useState(false)

    // this should be run only once per application lifetime
    useEffect(() => {
        if (disabled !== true) {
            initParticlesEngine(async (engine) => {
                // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
                // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
                // starting from v2 you can add only the features you need reducing the bundle size
                //await loadAll(engine)
                //await loadFull(engine)
                await loadSlim(engine)
                //await loadBasic(engine)
            }).then(() => {
                setInit(true)
            })
        }
    }, [disabled])

    // const particlesLoaded = async (container?: Container): Promise<void> => {}
    const particlesLoaded = useCallback(async () => {}, [])

    const options: ISourceOptions = useMemo(
        () => ({
            background: {
                color: {
                    // value: "#111113", // dark zinc 900
                    value: customColours.darkZinc[900]!,
                },
            },
            interactivity: {
                detectsOn: InteractivityDetect.window,
                events: {
                    // onClick: {
                    //     enable: true,
                    //     mode: ["attract"],
                    // },
                    onHover: {
                        enable: true,
                        mode: ["grab", "attract"],
                    },
                    resize: {
                        enable: true,
                    },
                },
                modes: {
                    // push: {
                    //     quantity: 7,
                    // },
                    // repulse: {
                    //     distance: 200,
                    //     duration: 0.4,
                    // },
                    grab: {
                        distance: 150,
                    },
                    attract: {
                        distance: 150,
                        // duration: 0.4,
                        easing: EasingType.easeOutQuad,
                        // factor: 1.5,
                        // maxSpeed: 50,
                        // speed: 2,
                    }
                },
            },
            particles: {
                color: {
                    value: [
                        // "#8258A2", // purple
                        // "#CA5377", // pink
                        // "#23366E", // dark blue
                        // "#4C8FCC", // light blue
                        customColours.brandPurple[500]!,
                        customColours.brandPink[500]!,
                        customColours.brandDarkBlue[500]!,
                        customColours.brandLightBlue[500]!,
                    ],
                },
                links: {
                    color: "random",
                    distance: 150,
                    enable: true,
                    opacity: 0.5,
                    width: 1,
                },
                move: {
                    direction: MoveDirection.none,
                    enable: true,
                    outModes: {
                        default: OutMode.out,
                    },
                    random: false,
                    speed: 2,
                    straight: false,
                },
                number: {
                    density: {
                        enable: true,
                        area: 800,
                    },
                    limit: {
                        mode: LimitMode.wait,
                        number: 160,
                    },
                    value: 160,
                },
                opacity: {
                    value: 0.5,
                },
                shape: {
                    type: DivType.circle,
                },
                size: {
                    value: 2,
                },
                collisions: {
                    enable: false,
                },
            },
            fpsLimit: 120,
            autoPlay: true,
            detectRetina: true,
            pauseOnBlur: true,
            pauseOnOutsideViewport: true,
            fullScreen: {
                enable: true,
            },
        }),
        [],
    )

    return init && disabled !== true ? (
        <Particles
            id="tsparticles"
            particlesLoaded={particlesLoaded}
            options={options}
        />
    ) : <></>
}

export default BackgroundParticles
