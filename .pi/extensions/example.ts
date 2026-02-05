import { ExtensionFactory } from "@mariozechner/pi-coding-agent";
import type { SettingDefinition } from "../../src";
import { getSetting, setSetting } from "../../src";

const ExampleExtension: ExtensionFactory = (pi) => {
  /**
   * Simple example that registers settings and reads one of them.
   */
  pi.events.emit("pi-extension-settings:register", {
    name: "example-extension",
    settings: [
      {
        id: "theme",
        label: "Theme",
        description: "Preferred UI theme",
        defaultValue: "light",
        values: ["light", "dark"],
      },
      {
        id: "username",
        label: "Username",
        description: "Name shown in logs",
        defaultValue: "",
      },
    ] satisfies SettingDefinition[],
  });

  const theme = getSetting("example-extension", "theme", "light");
  if (theme === "dark") {
    setSetting("example-extension", "username", "dark-mode-user");
  }
};

export default ExampleExtension;
