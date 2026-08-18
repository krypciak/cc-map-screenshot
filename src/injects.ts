import { Opts } from './options'

export const parallaxList: ig.GUI.Parallax[] = []

let res: (() => void) | undefined
export function prestartInject() {
    ig.Loader.inject({
        finalize() {
            // @ts-expect-error
            if (!this.gameClass) {
                res?.()
                res = undefined
            }
            this.parent()
        },
    })
    // @ts-expect-error
    ig.GlobalSettings.inject({
        // @ts-expect-error
        resolveEntitySettings(a, b) {
            return this.parent(a, b ?? {})
        },
    })

    sc.EnemyType.inject({
        onload(data) {
            try {
                return this.parent(data)
            } catch (e) {}
        },
    })

    ig.MAP.Background.inject({
        draw(x, y, width, height) {
            if (
                ig.isTakingScreenshot &&
                (Opts.hideTileRendering || (Opts.hideParallax && this.tilesetName?.includes('parallax')))
            )
                return
            return this.parent(x, y, width, height)
        },
    })

    sc.Arena.inject({
        onVarAccess() {},
    })

    sc.CommonEvent.inject({
        init(name, data) {
            data.event = []
            this.parent(name, data)
        },
    })

    ig.GUI.Parallax.inject({
        init(settings, callback) {
            this.parent(settings, callback)
            parallaxList.push(this)
        },
    })
}
