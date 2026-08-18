import { parallaxList } from './injects'
import { Opts } from './options'

export function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function removeAddon(addon: ig.GameAddon, game: ig.Game) {
    for (const key in game.addons) {
        const arr = game.addons[key as keyof ig.Game['addons']]
        arr.erase(addon as any)
    }
}

export function setPerf(enableFilter: boolean) {
    ig.perf.gui = !enableFilter || Opts.enableGui
    ig.perf.lighting = !enableFilter || Opts.enableLighting
    ig.perf.weather = !enableFilter || Opts.enableWeather
    ig.perf.envParticles = !enableFilter || Opts.enableEnvParticles
    ig.perf.drawSprites = !enableFilter || Opts.enableSprites
}

export function resizeGame(w: number, h: number, scale: number) {
    const contextBackup = ig.system.context
    try {
        ig.system.context = ig.system.canvas.getContext('2d')
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
    } finally {
        ig.system.context = contextBackup
    }
}

function hideEntity(entity: ig.Entity) {
    ig.game.shownEntities[entity.id] = null
}

function fixPlantBlink() {
    for (const entity of ig.game.entities) {
        if (
            !(entity instanceof ig.ENTITY.ItemDestruct) ||
            !(entity instanceof ig.ENTITY.Destructible) ||
            !(entity instanceof ig.ENTITY.RegenDestruct)
        ) {
            continue
        }

        entity.blinkTimer = 10000000
        entity.initAnimations()
        entity.updateSprites()
        entity.update()
    }
}

export async function takeScreenshot() {
    const gameSizeBackup = { w: ig.system.width, h: ig.system.height, scale: ig.system.contextScale }
    const cameraInBoundsBackup = ig.camera._cameraInBounds

    try {
        setPerf(true)
        ig.camera._cameraInBounds = true

        removeAddon(sc.npcRunner, ig.game)
        removeAddon(sc.commonEvents, ig.game)

        var toKill = [
            ig.ENTITY.Enemy,
            sc.NpcRunnerSpawner,
            sc.NPCRunnerEntity,
            ig.ENTITY.NPC,
            ig.ENTITY.Chest,
            ig.ENTITY.EventTrigger,
            ig.ENTITY.EnemySpawner,
        ]
        const entitiesToHideAndDisable = ig.game.entities.filter(entity =>
            toKill.some(clazz => entity instanceof clazz)
        )
        for (const entity of entitiesToHideAndDisable) {
            hideEntity(entity)
            entity.kill()
        }
        fixPlantBlink()

        resizeGame(ig.game.size.x, ig.game.size.y, 1)
        hideEntity(ig.game.playerEntity)
        await wait(100)

        return ig.system.canvas.toDataURL()
    } finally {
        setPerf(false)
        ig.camera._cameraInBounds = cameraInBoundsBackup
        resizeGame(gameSizeBackup.w, gameSizeBackup.h, gameSizeBackup.scale)
    }
}

function openImageWindow(src: string) {
    if (ig.platform == ig.PLATFORM_TYPES.DESKTOP) {
        const nw = (0, eval)(`require('nw.gui')`)
        if (nw) {
            nw.Window.open(src, { min_width: 1136, min_height: 640 })
            nw.Clipboard.get().set(src, 'png', false)
        } else {
            window.open(src)
        }
    } else {
        window.SHOW_SCREENSHOT(src)
    }
}

export async function takeScreenshotAndShow() {
    const data = await takeScreenshot()
    openImageWindow(data)
}
