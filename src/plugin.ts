import type { PluginClass } from 'ultimate-crosscode-typedefs/modloader/mod'
import type { Mod1 } from './types'
import { setModMetadata } from './mod-metadata'
import { prestartInject, run } from './screenshot'

export default class MapImage implements PluginClass {
    constructor(mod: Mod1) {
        setModMetadata(mod)
    }

    prestart() {
        prestartInject()
    }

    async poststart() {
        run()
    }
}
