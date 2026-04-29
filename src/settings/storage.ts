/**
 * Read/write extension settings to JSON files.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getAgentDir } from "@mariozechner/pi-coding-agent";

const SETTINGS_FILE_NAME = "settings-extensions.json";

type SettingsFile = Record<string, Record<string, string>>;

export interface SettingStorageOptions {
	/** Settings scope. Defaults to reading local with global fallback and writing global. */
	scope?: "global" | "local";
	/** Directory used for local settings. Defaults to process.cwd(). */
	cwd?: string;
	/** Directory used for global settings. Defaults to pi's agent directory. */
	agentDir?: string;
}

/**
 * Get the global settings file path.
 */
function getGlobalSettingsPath(agentDir = getAgentDir()): string {
	return join(agentDir, SETTINGS_FILE_NAME);
}

/**
 * Get the local settings file path for a project/folder.
 */
function getLocalSettingsPath(cwd = process.cwd()): string {
	return join(cwd, ".pi", SETTINGS_FILE_NAME);
}

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
 * Save settings to the global file.
 */
function saveSettingsFile(path: string, settings: SettingsFile): void {
	const dir = dirname(path);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	writeFileSync(path, JSON.stringify(settings, null, "\t"));
}

/**
 * Get a setting value for an extension.
 * Returns the stored local value, stored global value, provided default, or undefined.
 *
 * @param extensionName - Extension name
 * @param settingId - Setting ID within the extension
 * @param defaultValue - Default value if setting is not found
 * @param options - Storage scope options
 * @returns The setting value
 */
export function getSetting(
	extensionName: string,
	settingId: string,
	defaultValue?: string,
	options: SettingStorageOptions = {},
): string | undefined {
	const paths =
		options.scope === "global"
			? [getGlobalSettingsPath(options.agentDir)]
			: [getLocalSettingsPath(options.cwd), getGlobalSettingsPath(options.agentDir)];

	for (const path of paths) {
		const settings = loadSettingsFile(path);
		const extSettings = settings[extensionName];
		if (extSettings && settingId in extSettings) {
			return extSettings[settingId];
		}
	}

	return defaultValue;
}

/**
 * Set a setting value for an extension.
 * Writes to the global settings file unless options.scope is "local".
 *
 * @param extensionName - Extension name
 * @param settingId - Setting ID within the extension
 * @param value - Value to set
 * @param options - Storage scope options
 */
export function setSetting(
	extensionName: string,
	settingId: string,
	value: string,
	options: SettingStorageOptions = {},
): void {
	const path = options.scope === "local" ? getLocalSettingsPath(options.cwd) : getGlobalSettingsPath(options.agentDir);
	const settings = loadSettingsFile(path);

	if (!settings[extensionName]) {
		settings[extensionName] = {};
	}
	settings[extensionName][settingId] = value;

	saveSettingsFile(path, settings);
}
