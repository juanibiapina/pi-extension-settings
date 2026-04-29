import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { getSetting, setSetting } from "../src/settings/storage.js";

function makeDirs() {
	const root = mkdtempSync(join(tmpdir(), "pi-extension-settings-"));
	return {
		agentDir: join(root, "agent"),
		cwd: join(root, "project"),
	};
}

describe("local settings scope", () => {
	it("writes local settings to the project .pi directory", () => {
		const { agentDir, cwd } = makeDirs();

		setSetting("my-extension", "debug", "on", { scope: "local", cwd, agentDir });

		const localPath = join(cwd, ".pi", "settings-extensions.json");
		assert.equal(existsSync(localPath), true);
		assert.deepEqual(JSON.parse(readFileSync(localPath, "utf-8")), {
			"my-extension": {
				debug: "on",
			},
		});
		assert.equal(existsSync(join(agentDir, "settings-extensions.json")), false);
	});

	it("prefers local settings over global settings by default", () => {
		const { agentDir, cwd } = makeDirs();

		setSetting("my-extension", "debug", "off", { agentDir });
		setSetting("my-extension", "debug", "on", { scope: "local", cwd, agentDir });

		assert.equal(getSetting("my-extension", "debug", "default", { cwd, agentDir }), "on");
	});

	it("can read only global settings", () => {
		const { agentDir, cwd } = makeDirs();

		setSetting("my-extension", "debug", "off", { agentDir });
		setSetting("my-extension", "debug", "on", { scope: "local", cwd, agentDir });

		assert.equal(getSetting("my-extension", "debug", "default", { scope: "global", cwd, agentDir }), "off");
	});
});
