import type { PluginClass } from 'ultimate-crosscode-typedefs/modloader/mod'
import type { Mod1 } from './types'
import { setModMetadata } from './mod-metadata'
import { registerOpts } from './options'
import { prestartInject } from './injects'

export default class MapImage implements PluginClass {
    constructor(mod: Mod1) {
        setModMetadata(mod)
    }

    prestart() {
        registerOpts()
        prestartInject()
    }

    async poststart() {
        // run()
    }
}
