import { Injector, Autowired } from '@opensumi/di';
import { BasicModule, CommandRegistry, Deferred } from '@opensumi/ide-core-common';

import { AppConfig } from './react-providers/config-provider';

export const IClientApp = Symbol('CLIENT_APP_TOKEN');

export interface IClientApp {
  // 初始化状态。 延期 ？
  appInitialized: Deferred<void>;
  browserModules: BrowserModule<any>[];
  injector: Injector;
  config: AppConfig;
  commandRegistry: CommandRegistry;
  fireOnReload: (forcedReload?: boolean) => void;
}

// 核心浏览器模块。
export abstract class BrowserModule<T = any> extends BasicModule {
  // 自动注入
  @Autowired(IClientApp)
  protected app: IClientApp;
  public preferences?: (inject: Injector) => void;
  public component?: React.ComponentType<T>;
  // 脱离于layout渲染的模块
  public isOverlay?: boolean;
}
