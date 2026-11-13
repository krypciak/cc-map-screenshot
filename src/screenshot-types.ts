export {}
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
