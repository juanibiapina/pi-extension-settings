# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2026-07-20

### Added

- Per-project settings: new `/extension-settings-local` command and a `scope: "local"` option on `getSetting`/`setSetting` that stores settings in `.pi/settings-extensions.json`, overriding global settings for the current folder

## [0.8.0] - 2026-05-20

### Changed

- Removed tsc build step: pi now loads TypeScript source directly via jiti
- Changed `pi.extensions` entry point from `./dist/index.js` to `./src/index.ts`
- Removed `peerDependencies` (`@earendil-works/pi-coding-agent`, `@earendil-works/pi-tui`) — pi provides these at runtime
- Removed `main` and `types` fields (no longer shipping compiled JS)
- Removed `build`, `dev`, `clean`, and `prepublishOnly` scripts
- Changed published `files` from `dist/**/*` to `src/**/*`
## [0.7.0] - 2026-05-20

### Changed

- Migrated from `@mariozechner/pi-coding-agent` and `@mariozechner/pi-tui` to `@earendil-works/pi-coding-agent` and `@earendil-works/pi-tui`

## [0.6.0] - 2026-03-23

### Changed

- **Breaking:** Requires pi >= 0.61.0 due to namespaced keybinding IDs
- Migrated from removed `getEditorKeybindings()` to `getKeybindings()` with namespaced IDs (`tui.select.up`, `tui.select.down`, `tui.select.confirm`, `tui.select.cancel`)
- Updated `@mariozechner/pi-coding-agent` dev dependency to ^0.62.0

## [0.5.1] - 2026-03-07

### Fixed

- Repository URL in package.json now uses https instead of git+ssh

## [0.5.0] - 2026-02-07

### Added

- **Ordered multi-select settings** - New `options` field on `SettingDefinition` for settings where users pick and reorder items from a list
- **`OrderedMultiSelect` component** - Submenu UI with toggle (Space), reorder (Shift+↑/↓), confirm (Enter), and cancel (Esc)
- **`OrderedListOption` type** - Exported for extensions that define ordered list settings

## [0.4.0] - 2026-02-05

### Fixed

- Extension headers are no longer editable in the settings UI

## [0.3.0] - 2026-02-03

### Added

- **Pi extension** - Package is now a pi extension with `/extension-settings` command
- **`getSetting(name, id, defaultValue?)`** - Read a setting value with optional default
- **`setSetting(name, id, value)`** - Write a setting value to global settings file
- **Interactive UI** - `/extension-settings` shows all registered settings grouped by extension with search
- **String input support** - Settings without `values` array allow free-form text input
- **Event-based registration** - Extensions emit `pi-lib:register` event to register settings for the UI

### Removed

- **`loadConfig()`** - Removed in favor of the new API

## [0.2.0] - 2026-02-02

### Changed

- **Breaking:** Settings now stored in a single `settings-extensions.json` file with one key per extension
  - Global: `~/.pi/agent/settings-extensions.json`
  - Project: `<cwd>/.pi/settings-extensions.json`
- Migration: Move settings from `<name>.json` to `settings-extensions.json` under the key `"<name>"`

## [0.1.0] - 2026-02-02

Initial release.

- `loadConfig<T>(name)` - Load extension configuration from global and project locations
  - Global: `~/.pi/agent/<name>.json`
  - Project: `<cwd>/.pi/<name>.json`
- Deep merging of nested objects with project config taking precedence
