import { getAgentDir } from "@mariozechner/pi-coding-agent";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

/**
 * Deep merge two objects. Values from `overrides` take precedence.
 * Arrays are replaced, not merged.
 */
function deepMerge<T extends Record<string, unknown>>(base: T, overrides: Partial<T>): T {
	const result = { ...base } as T;

	for (const key of Object.keys(overrides) as (keyof T)[]) {
		const overrideValue = overrides[key];
		const baseValue = base[key];

		if (overrideValue === undefined) {
			continue;
		}

		if (
			typeof overrideValue === "object" &&
			overrideValue !== null &&
			!Array.isArray(overrideValue) &&
			typeof baseValue === "object" &&
			baseValue !== null &&
			!Array.isArray(baseValue)
		) {
			(result as Record<string, unknown>)[key as string] = deepMerge(
				baseValue as Record<string, unknown>,
				overrideValue as Record<string, unknown>,
			);
		} else {
			(result as Record<string, unknown>)[key as string] = overrideValue;
		}
	}

	return result;
}

const CONFIG_DIR_NAME = ".pi";

const SETTINGS_FILE_NAME = "settings-extensions.json";

type SettingsFile = Record<string, Record<string, unknown>>;

/**
 * Load the settings file. Returns empty object if file doesn't exist or is invalid.
 */
function loadSettingsFile(path: string): SettingsFile {
	if (!existsSync(path)) {
		return {};
	}
	try {
		const content = readFileSync(path, "utf-8");
		return JSON.parse(content) as SettingsFile;
	} catch {
		return {};
	}
}

/**
 * Load extension config from global and project locations, with project taking precedence.
 *
 * Config file locations:
 * - Global: ~/.pi/agent/settings-extensions.json
 * - Project: <cwd>/.pi/settings-extensions.json
 *
 * Each file contains a JSON object with extension names as keys:
 * ```json
 * {
 *   "my-extension": { "timeout": 30 },
 *   "another-extension": { "debug": true }
 * }
 * ```
 *
 * @param name - Extension name (used as key in the settings file)
 * @returns Merged config with project values taking precedence
 *
 * @example
 * ```typescript
 * interface MyConfig {
 *   timeout?: number;
 *   debug?: boolean;
 * }
 *
 * const config = loadConfig<MyConfig>("my-extension");
 * ```
 */
export function loadConfig<T extends Record<string, unknown>>(name: string): T {
	const globalPath = join(getAgentDir(), SETTINGS_FILE_NAME);
	const projectPath = join(process.cwd(), CONFIG_DIR_NAME, SETTINGS_FILE_NAME);

	const globalSettings = loadSettingsFile(globalPath);
	const projectSettings = loadSettingsFile(projectPath);

	const globalConfig = (globalSettings[name] ?? {}) as Partial<T>;
	const projectConfig = (projectSettings[name] ?? {}) as Partial<T>;

	return deepMerge(globalConfig as T, projectConfig) as T;
}
