import * as React from 'react';
import { ConfigProvider, /*SlotLocation,*/SlotRenderer } from '../react-providers';
import { IClientApp } from '../browser-module';
import * as ReactDom from 'react-dom';
import {SlotLocation} from '../react-providers/slot';

export interface AppProps {
  app: IClientApp;
  main: React.FunctionComponent;
  overlay?: React.FunctionComponent;
}

export function App(props: AppProps) {
  return (
    <ConfigProvider value={ props.app.config }>
      <SlotRenderer Component={props.main} />
      { props.overlay && <SlotRenderer Component={props.overlay} /> }
    </ConfigProvider>
  );
}

export function renderClientApp(app: IClientApp, dom: HTMLElement) {
  const iterModules = app.browserModules.values();
  // 默认的第一个 Module 的 Slot 必须是 main
  const firstModule = iterModules.next().value;
  // 默认的第二个Module为overlay（临时方案）
  const secondModule = iterModules.next().value;

  return new Promise((resolve) => {
    ReactDom.render((
      <App app={app} main={firstModule.component as React.FunctionComponent} overlay={secondModule.component as React.FunctionComponent} />
    ), dom , async () => {
      // TODO 先实现加的 Loading，待状态接入后基于 stateService 来管理加载流程
      resolve();
    });
  });

}
