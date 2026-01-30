import { InjectionToken } from '@angular/core';

export interface AppSettings {
  testModus: number;
}

export const APP_SETTINGS = new InjectionToken<AppSettings>('APP_SETTINGS');

export const DEFAULT_APP_SETTINGS: AppSettings = {
  testModus: 0,
};
