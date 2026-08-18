import type { Options } from 'ccmodmanager/types/mod-options'
import { modMetadata } from './mod-metadata'
import { takeScreenshot } from './screenshot'

export let Opts: ReturnType<typeof modmanager.registerAndGetModOptions<ReturnType<typeof registerOpts>>>

export function registerOpts() {
    const opts = {
        general: {
            settings: {
                title: 'General',
                tabIcon: 'general',
            },
            headers: {
                general: {
                    screenshotKeybinding: {
                        type: 'CONTROLS',
                        init: { key1: ig.KEY.F6 },
                        global: false,
                        pressEvent() {
                            takeScreenshot()
                        },
                        name: 'Screenshot key',
                        description: 'Press while in game to take a full map screenshot!',
                    },
                    hideParallax: {
                        type: 'CHECKBOX',
                        init: false,
                        name: 'Hide parallax',
                        description: `Don't render parallaxes`,
                    },
                    enableLighting: {
                        type: 'CHECKBOX',
                        init: true,
                        name: 'Enable lighting',
                        description: 'Enable lighting in screenshots',
                    },
                    enableWeather: {
                        type: 'CHECKBOX',
                        init: true,
                        name: 'Enable weather',
                        description: 'Enable weather effects in screenshots',
                    },
                    enableEnvParticles: {
                        type: 'CHECKBOX',
                        init: true,
                        name: 'Enable env particles',
                        description: 'Enable environment particles in screenshots',
                    },
                    enableSprites: {
                        type: 'CHECKBOX',
                        init: true,
                        name: 'Enable sprites',
                        description: 'Enable drawing entity sprites in screenshots',
                    },
                    enableGui: {
                        type: 'CHECKBOX',
                        init: false,
                        name: 'Enable gui',
                        description: 'Enable gui rendering in screenshots',
                    },
                },
            },
        },
    } as const satisfies Options

    Opts = modmanager.registerAndGetModOptions(
        {
            modId: modMetadata.manifest.id,
            title: modMetadata.manifest.title,
        },
        opts
    )
    return opts
}
