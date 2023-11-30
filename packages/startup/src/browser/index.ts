import { Provider, Injectable } from '@opensumi/di';
import { BrowserModule } from '@opensumi/ide-core-browser';

import { StartupContribution } from './startup.contribution';

// Node 平台以及浏览器平台，都需要继承并提供自定义实现。
// 启动模块以及 Contribution.
@Injectable()
export class StartupModule extends BrowserModule {
  // 浏览器自行实现的 Contribution
  providers: Provider[] = [StartupContribution];
}
