import { PreferenceScope } from './preference-scope';
import { PreferenceItem } from '@ali/ide-core-common';

// 这些设置选项生效时间太早, 并且可能在app生命周期外生效，不能只由preference服务进行管理
export interface IExternalPreferenceProvider<T = any> {
  get(scope: PreferenceScope): T | undefined;
  set(value: T, scope: PreferenceScope): void;
  onDidChange?: ({value: T, scope: PreferenceScope}) => void;
}

const providers = new Map<string, IExternalPreferenceProvider>();

export function registerExternalPreferenceProvider<T>(name, provider: IExternalPreferenceProvider<T>) {
  providers.set(name, provider); // 可覆盖
}

export function getExternalPreferenceProvider(name) {
  return providers.get(name);
}

export function getPreferenceThemeId(): string {
  return getExternalPreference<string>('general.theme').value;
}

export function getPreferenceIconThemeId(): string {
  return getExternalPreference<string>('general.icon').value;
}

export function getPreferenceLanguageId(): string {
  return getExternalPreference<string>('general.language').value;
}

// 默认使用localStorage
function registerLocalStorageProvider(key: string) {
  registerExternalPreferenceProvider<string>(key, {
    set: (value, scope) => {
      if ((global as any).localStorage) {
        localStorage.setItem(scope + `:${key}`, value);
      }
    },
    get: (scope) => {
      if ((global as any).localStorage) {
        return localStorage.getItem(scope + `:${key}`) || undefined;
      }
    },
  });
}

registerLocalStorageProvider('general.theme');
registerLocalStorageProvider('general.icon');
registerLocalStorageProvider('general.language');

export function getExternalPreference<T>(preferenceName: string, schema?: PreferenceItem): {value: T, scope: PreferenceScope } {
  for (const scope of PreferenceScope.getReversedScopes()) {
    const value = providers.get(preferenceName)!.get(scope);
    if (value !== undefined) {
      return {
        value,
        scope,
      };
    }
  }
  return {
    value: schema && schema.default,
    scope: PreferenceScope.Default,
  };
}
