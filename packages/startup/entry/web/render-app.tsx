// eslint-disable-next-line no-console
console.time('Render');

import { Injector } from '@opensumi/di';
import { IClientAppOpts } from '@opensumi/ide-core-browser';
import { ClientApp } from '@opensumi/ide-core-browser/lib/bootstrap/app';
import { uuid } from '@opensumi/ide-core-common';

import { DefaultLayout } from './layout';

const CLIENT_ID = 'W_' + uuid();

export async function renderApp(opts: IClientAppOpts) {
  const defaultHost = process.env.HOST || window.location.hostname;
  const injector = new Injector();
  opts.workspaceDir =
    opts.workspaceDir || process.env.SUPPORT_LOAD_WORKSPACE_BY_HASH
      ? window.location.hash.slice(1)
      : process.env.WORKSPACE_DIR;

  opts.injector = injector;
  opts.extensionDir = opts.extensionDir || process.env.EXTENSION_DIR;
  opts.wsPath = process.env.WS_PATH || `ws://${defaultHost}:8000`;

  // TODO: Worker 单独起了一个端口？
  opts.extWorkerHost = opts.extWorkerHost || process.env.EXTENSION_WORKER_HOST;
  const anotherHostName = process.env.WEBVIEW_HOST || defaultHost;
  // TODO: 底座中包含的 Webview 都用同一个端口代理过去
  opts.webviewEndpoint = `http://${anotherHostName}:8899`;
  opts.editorBackgroundImage =
    'https://img.alicdn.com/imgextra/i2/O1CN01dqjQei1tpbj9z9VPH_!!6000000005951-55-tps-87-78.svg';
  opts.layoutComponent = DefaultLayout;
  opts.clientId = CLIENT_ID;
  opts.didRendered = () => {
    // eslint-disable-next-line no-console
    console.timeEnd('Render');
  };

  const app = new ClientApp(opts);

  app.fireOnReload = (forcedReload: boolean) => {
    window.location.reload();
  };

  // 挂载
  app.start(document.getElementById('main')!, 'web');
}
