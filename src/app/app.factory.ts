import { SettingsService } from "./core/settings/settings.service";

/**
 * Loads the settings from the cache file.
 */
export function settingsFactory(
    settingsService: SettingsService
) {
    return async () => {
        await settingsService.setFile();
    };
}