# @juanibiapina/pi-extension-settings

A [pi](https://github.com/badlogic/pi-mono) extension that provides centralized settings management for all extensions.

## Features

- **`/extension-settings` command** - Interactive UI to configure global extension settings
- **`/extension-settings-local` command** - Interactive UI to configure per-project/folder settings
- **Helpers for reading/writing** - `getSetting()` and `setSetting()` functions
- **Ordered multi-select** - Settings where users pick and reorder items from a list
- **Persistent storage** - Global settings stored in `~/.pi/agent/settings-extensions.json`; local settings stored in `.pi/settings-extensions.json`

## For Users

Install the extension to get the `/extension-settings` command, which provides an interactive UI to configure settings for all extensions that support it:

```bash
pi install npm:@juanibiapina/pi-extension-settings
```

> **⚠️ Load Order:** `pi-extension-settings` must appear **before** any extension that registers settings in your `packages` array in `~/.pi/settings.json`. Extensions register via the event bus at load time, so if `pi-extension-settings` hasn't loaded yet, those registrations are silently lost.

Then use `/extension-settings` in pi to edit global settings, or `/extension-settings-local` to edit settings for the current project/folder:

- Settings are grouped by extension with headers
- Use arrow keys to navigate
- Press Enter or Space to cycle through values (or edit string inputs)
- Type to search/filter settings
- Press Escape to close

## For Extension Authors

If you're developing an extension and want to use the settings system, add this package as a dependency in your extension's `package.json`:

```json
{
  "dependencies": {
    "@juanibiapina/pi-extension-settings": "^0.5.0"
  }
}
```

This gives you access to `getSetting()` and `setSetting()` helpers, and lets you register settings so they appear in the `/extension-settings` UI.

### Register Settings (for the UI)

Emit the `pi-extension-settings:register` event during extension load to make your settings appear in `/extension-settings`:

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import type { SettingDefinition } from "@juanibiapina/pi-extension-settings";

export default function myExtension(pi: ExtensionAPI) {
  pi.events.emit("pi-extension-settings:register", {
    name: "my-extension",
    settings: [
      {
        id: "timeout",
        label: "Request Timeout",
        description: "Timeout in seconds for API requests",
        defaultValue: "30",
        values: ["10", "30", "60", "120"],  // Cycles through these values
      },
      {
        id: "debug",
        label: "Debug Mode",
        description: "Enable verbose logging",
        defaultValue: "off",
        values: ["on", "off"],
      },
      {
        id: "projectName",
        label: "Project Name",
        description: "Name used in commit messages",
        defaultValue: "",
        // No 'values' = free-form string input
      },
      {
        id: "enabledModels",
        label: "Enabled Models",
        description: "Pick and reorder your preferred models",
        defaultValue: "",
        // Ordered multi-select: opens a submenu to toggle and reorder items
        options: [
          { id: "model-a", label: "Model A" },
          { id: "model-b", label: "Model B" },
          { id: "model-c", label: "Model C" },
        ],
      },
    ] satisfies SettingDefinition[]
  });
}
```

### Read/Write Settings

Use the helper functions to read and write settings:

```typescript
import { getSetting, setSetting } from "@juanibiapina/pi-extension-settings";

// Read a setting. Local settings override global settings by default, then the default is used.
const timeout = getSetting("my-extension", "timeout", "30");

// Write a global setting
setSetting("my-extension", "debug", "on");

// Write a local setting to .pi/settings-extensions.json in the current folder
setSetting("my-extension", "debug", "on", { scope: "local" });
```

## API Reference

### `getSetting(extensionName, settingId, defaultValue?, options?)`

Get a setting value. By default, checks local project/folder settings first, then global settings, then the provided default.

```typescript
const value = getSetting("my-extension", "timeout", "30");
const globalOnly = getSetting("my-extension", "timeout", "30", { scope: "global" });
```

### `setSetting(extensionName, settingId, value, options?)`

Set a setting value. Writes to `~/.pi/agent/settings-extensions.json` by default, or `.pi/settings-extensions.json` when `options.scope` is `"local"`.

```typescript
setSetting("my-extension", "debug", "on");
setSetting("my-extension", "debug", "on", { scope: "local" });
```

### `SettingDefinition` (type)

Type for settings registration (use with `satisfies` for type checking):

```typescript
interface SettingDefinition {
  id: string;                   // Unique ID within the extension
  label: string;                // Display label in UI
  description?: string;         // Optional help text shown when selected
  defaultValue: string;         // Default value if not set
  values?: string[];            // Values to cycle through (omit for free-form string input)
  options?: OrderedListOption[]; // Ordered multi-select options (mutually exclusive with values)
}

interface OrderedListOption {
  id: string;    // Value stored in the comma-separated setting
  label: string; // Display label in the menu
}
```

When `options` is set, Enter opens a submenu where items can be toggled (Space), reordered (Shift+↑/↓), confirmed (Enter), or cancelled (Esc). The value is stored as comma-separated IDs.

### Event: `pi-extension-settings:register`

Emit this event to register settings for the UI:

```typescript
pi.events.emit("pi-extension-settings:register", {
  name: string;                    // Extension name
  settings: SettingDefinition[];   // Array of setting definitions
});
```

## Storage

Global settings are stored in `~/.pi/agent/settings-extensions.json`. Local project/folder settings are stored in `.pi/settings-extensions.json` and override global settings when reading by default:

```json
{
  "my-extension": {
    "timeout": "60",
    "debug": "on"
  },
  "another-extension": {
    "theme": "dark"
  }
}
```

## License

MIT
