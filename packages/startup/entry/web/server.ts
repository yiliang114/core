import { startServer } from '@opensumi/ide-dev-tool/src/server';
import { ExpressFileServerModule } from '@opensumi/ide-express-file-server/lib/node';
import { OpenerModule } from '@opensumi/ide-remote-opener/lib/node';

import { CommonNodeModules } from '../../src/node/common-modules';

// packages/startup 启动调试 kaitian 的 Node 入口
// 本质上就是启动一个 Node 服务，用来代理静态资源，访问 Web
startServer({
  // TODO: modules 与 providers 的区别是什么？
  // 按照我原有的理解，modules 是组装起来的各个模块，有一些必须的模块，装载之后才可以正常启动；而 provider 是提供给其他模块使用的服务，一般是用于提供数据，提供服务等。
  modules: [...CommonNodeModules, ExpressFileServerModule, OpenerModule],
});
