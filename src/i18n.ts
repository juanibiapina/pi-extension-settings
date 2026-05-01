import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

type Locale = "en" | "es" | "fr" | "pt-BR";
type Params = Record<string, string | number>;

const translations: Record<Exclude<Locale, "en">, Record<string, string>> = {
	es: {
		"settings.noneRegistered": "Ninguna extensión ha registrado ajustes. Asegúrate de que pi-extension-settings aparezca antes que las extensiones consumidoras en el array packages de ~/.pi/settings.json.",
		"settings.title": "Ajustes de extensiones",
		"settings.noneAvailable": "No hay ajustes disponibles",
		"settings.noneMatching": "No hay ajustes coincidentes",
		"settings.hint.editing": "Enter para confirmar · Esc para cancelar",
		"settings.hint.search": "Escribe para buscar · Enter/Space para cambiar · Esc para cancelar",
		"settings.hint.default": "Enter/Space para cambiar · Esc para cancelar",
	},
	fr: {
		"settings.noneRegistered": "Aucune extension n’a enregistré de paramètres. Assurez-vous que pi-extension-settings apparaît avant les extensions consommatrices dans le tableau packages de ~/.pi/settings.json.",
		"settings.title": "Paramètres des extensions",
		"settings.noneAvailable": "Aucun paramètre disponible",
		"settings.noneMatching": "Aucun paramètre correspondant",
		"settings.hint.editing": "Entrée pour confirmer · Échap pour annuler",
		"settings.hint.search": "Tapez pour rechercher · Entrée/Espace pour modifier · Échap pour annuler",
		"settings.hint.default": "Entrée/Espace pour modifier · Échap pour annuler",
	},
	"pt-BR": {
		"settings.noneRegistered": "Nenhuma extensão registrou configurações. Verifique se pi-extension-settings aparece antes das extensões consumidoras no array packages em ~/.pi/settings.json.",
		"settings.title": "Configurações de extensões",
		"settings.noneAvailable": "Nenhuma configuração disponível",
		"settings.noneMatching": "Nenhuma configuração correspondente",
		"settings.hint.editing": "Enter para confirmar · Esc para cancelar",
		"settings.hint.search": "Digite para buscar · Enter/Space para alterar · Esc para cancelar",
		"settings.hint.default": "Enter/Space para alterar · Esc para cancelar",
	},
};

let currentLocale: Locale = "en";

export function initI18n(pi: ExtensionAPI): void {
	pi.events?.emit?.("pi-core/i18n/registerBundle", {
		namespace: "pi-extension-settings",
		defaultLocale: "en",
		locales: translations,
	});

	pi.events?.emit?.("pi-core/i18n/requestApi", {
		onReady: (api: { getLocale?: () => string; onLocaleChange?: (cb: (locale: string) => void) => void }) => {
			const next = api.getLocale?.();
			if (isLocale(next)) currentLocale = next;
			api.onLocaleChange?.((locale) => {
				if (isLocale(locale)) currentLocale = locale;
			});
		},
	});
}

export function t(key: string, fallback: string, params: Params = {}): string {
	const template = currentLocale === "en" ? fallback : translations[currentLocale]?.[key] ?? fallback;
	return template.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}

function isLocale(locale: string | undefined): locale is Locale {
	return locale === "en" || locale === "es" || locale === "fr" || locale === "pt-BR";
}
