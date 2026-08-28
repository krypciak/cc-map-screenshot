import { Opts } from './options'

export const parallaxList: ig.GUI.Parallax[] = []

export function prestartInject() {
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

    ig.GUI.Parallax.inject({
        init(settings, callback) {
            this.parent(settings, callback)
            parallaxList.push(this)
        },
    })
}
