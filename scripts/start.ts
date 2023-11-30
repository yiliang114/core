import { startFromFolder } from './fn/module';
import { argv } from '../packages/core-common/src/node/cli';

const folderName = (argv.folder as string) || 'packages/startup';
const scriptName = (argv.script as string) || 'start';

if (!folderName) {
  throw Error('folderName is required.');
}

// 指定文件夹（指定工作空间），以及脚本名：启动或者构建。
// 默认情况下， 通过启动 packages/startup 中的 Node 服务，代理静态资源，以及启动浏览器。
startFromFolder(folderName, scriptName);
