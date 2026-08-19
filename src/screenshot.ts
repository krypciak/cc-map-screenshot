import { parallaxList } from './injects'
import { Opts } from './options'

export function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function setPerf(enableFilter: boolean) {
    ig.perf.gui = !enableFilter || Opts.enableGui
    ig.perf.lighting = !enableFilter || Opts.enableLighting
    ig.perf.weather = !enableFilter || Opts.enableWeather
    ig.perf.envParticles = !enableFilter || Opts.enableEnvParticles
    ig.perf.drawSprites = !enableFilter || Opts.enableSprites
}

function wrapSetContext(func: () => void) {
    const contextBackup = ig.system.context
    try {
        ig.system.context = ig.system.canvas.getContext('2d')
        func()
    } finally {
        ig.system.context = contextBackup
    }
}
export function resizeGame(w: number, h: number, scale: number) {
    wrapSetContext(() => {
        ig.system.resize(w, h, scale)
        ig.ScreenBufferPool.clearBuffers()
        ig.light.lightCanvas = ig.$new('canvas')
        ig.light.lightCanvas.width = ig.system.contextWidth + 1
        ig.light.lightCanvas.height = ig.system.contextHeight + 1
        ig.light.lightContext = ig.system.getBufferContext(ig.light.lightCanvas)
        ig.envParticles.width = ig.system.width + 64
        ig.envParticles.height = ig.system.height + 64

        for (const parallax of parallaxList) {
            parallax.hook.size.x = w
            parallax.hook.size.y = h
        }
    })
}

function hideEntity(entity: ig.Entity): boolean {
    if (!ig.game.shownEntities[entity.id]) return false
    ig.game.shownEntities[entity.id] = null
    return true
}
function showEntity(entity: ig.Entity) {
    ig.game.shownEntities[entity.id] = entity
}

function resetEntityAnimationTimer() {
    for (const entity of ig.game.entities) {
        if (!(entity instanceof ig.AnimatedEntity)) continue
        if (
            !(entity instanceof ig.ENTITY.ItemDestruct) &&
            !(entity instanceof ig.ENTITY.Destructible) &&
            !(entity instanceof ig.ENTITY.RegenDestruct)
        ) {
            entity.animState.timer = 0
        } else {
            entity.blinkTimer = Math.random() * 5 + 1
            entity.initAnimations()
            entity.updateSprites()
            entity.update()
        }
    }
}

declare global {
    namespace ig {
        var isTakingScreenshot: boolean | undefined
    }
}

const keybindingId = 'cc-map-screenshot-screenshotKeybinding'
declare global {
    namespace ig {
        namespace Input {
            interface KnownActions {
                [keybindingId]: true
            }
        }
    }
}

export function takeScreenshot() {
    const gameSizeBackup = { w: ig.system.width, h: ig.system.height, scale: ig.system.contextScale }
    const cameraInBoundsBackup = ig.camera._cameraInBounds

    let hiddenEntities: ig.Entity[] = []

    try {
        ig.isTakingScreenshot = true
        setPerf(true)
        ig.camera._cameraInBounds = true

        const entityClassesToHide: (new (x: number, y: number, z: number, settings: any) => ig.Entity)[] = []
        if (Opts.hidePlayer) entityClassesToHide.push(ig.ENTITY.Player)
        if (Opts.hideEnemies) entityClassesToHide.push(ig.ENTITY.Enemy, ig.ENTITY.EnemySpawner)
        if (Opts.hideNpcRunners) entityClassesToHide.push(sc.NPCRunnerEntity)
        if (Opts.hideNpcs) entityClassesToHide.push(ig.ENTITY.NPC)
        if (Opts.hideChests) entityClassesToHide.push(ig.ENTITY.Chest)

        hiddenEntities = ig.game.entities
            .filter(entity => entityClassesToHide.some(clazz => entity instanceof clazz))
            .filter(hideEntity)

        resetEntityAnimationTimer()

        resizeGame(ig.game.size.x, ig.game.size.y, 1)
        wrapSetContext(() => {
            const backupFirstUpdateLoop = ig.game.firstUpdateLoop
            ig.game.firstUpdateLoop = false

            ig.camera.onPostUpdate()
            ig.game.update()
            if (ig.perf.draw) {
                ig.game.draw()
                ig.game.finalDraw()
            }

            ig.game.firstUpdateLoop = backupFirstUpdateLoop
        })

        return ig.system.canvas.toDataURL()
    } finally {
        ig.isTakingScreenshot = false
        setPerf(false)
        ig.camera._cameraInBounds = cameraInBoundsBackup

        for (const entity of hiddenEntities) showEntity(entity)

        resizeGame(gameSizeBackup.w, gameSizeBackup.h, gameSizeBackup.scale)

        window.instanceinator?.retile()
    }
}

function openImageWindow(src: string) {
    if (ig.platform == ig.PLATFORM_TYPES.DESKTOP) {
        if (window.nw) {
            fetch(src)
                .then(r => r.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob)

                    window.nw.Window.open(url, {
                        width: ig.system.canvas.width + 20,
                        height: ig.system.canvas.height + 60,
                    })
                })
            window.nw.Clipboard.get().set(src, 'png', false)
        } else {
            window.open(src)
        }
    } else {
        window.SHOW_SCREENSHOT(src)
    }
}

export function takeScreenshotAndShow() {
    const data = takeScreenshot()
    openImageWindow(data)
}
