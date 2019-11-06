import { DebugProtocol } from 'vscode-debugprotocol';
import {
  Event,
  Emitter,
  DisposableCollection,
  Disposable,
  IDisposable,
  Deferred,
} from '@ali/ide-core-browser';
import { IWebSocket } from '@ali/ide-connection';
import { DEBUG_SESSION_CLOSE_WHILE_RECIVE_CLOSE_EVENT } from '../common';
import { OutputChannel } from '@ali/ide-output/lib/browser/output.channel';

export interface DebugExitEvent {
  code?: number;
  reason?: string | Error;
}

export type DebugRequestHandler = (request: DebugProtocol.Request) => any;

export interface DebugRequestTypes {
  'attach': [DebugProtocol.AttachRequestArguments, DebugProtocol.AttachResponse];
  'completions': [DebugProtocol.CompletionsArguments, DebugProtocol.CompletionsResponse];
  'configurationDone': [DebugProtocol.ConfigurationDoneArguments, DebugProtocol.ConfigurationDoneResponse];
  'continue': [DebugProtocol.ContinueArguments, DebugProtocol.ContinueResponse];
  'disconnect': [DebugProtocol.DisconnectArguments, DebugProtocol.DisconnectResponse];
  'evaluate': [DebugProtocol.EvaluateArguments, DebugProtocol.EvaluateResponse];
  'exceptionInfo': [DebugProtocol.ExceptionInfoArguments, DebugProtocol.ExceptionInfoResponse];
  'goto': [DebugProtocol.GotoArguments, DebugProtocol.GotoResponse];
  'gotoTargets': [DebugProtocol.GotoTargetsArguments, DebugProtocol.GotoTargetsResponse];
  'initialize': [DebugProtocol.InitializeRequestArguments, DebugProtocol.InitializeResponse];
  'launch': [DebugProtocol.LaunchRequestArguments, DebugProtocol.LaunchResponse];
  'loadedSources': [DebugProtocol.LoadedSourcesArguments, DebugProtocol.LoadedSourcesResponse];
  'modules': [DebugProtocol.ModulesArguments, DebugProtocol.ModulesResponse];
  'next': [DebugProtocol.NextArguments, DebugProtocol.NextResponse];
  'pause': [DebugProtocol.PauseArguments, DebugProtocol.PauseResponse];
  'restart': [DebugProtocol.RestartArguments, DebugProtocol.RestartResponse];
  'restartFrame': [DebugProtocol.RestartFrameArguments, DebugProtocol.RestartFrameResponse];
  'reverseContinue': [DebugProtocol.ReverseContinueArguments, DebugProtocol.ReverseContinueResponse];
  'scopes': [DebugProtocol.ScopesArguments, DebugProtocol.ScopesResponse];
  'setBreakpoints': [DebugProtocol.SetBreakpointsArguments, DebugProtocol.SetBreakpointsResponse];
  'setExceptionBreakpoints': [DebugProtocol.SetExceptionBreakpointsArguments, DebugProtocol.SetExceptionBreakpointsResponse];
  'setExpression': [DebugProtocol.SetExpressionArguments, DebugProtocol.SetExpressionResponse];
  'setFunctionBreakpoints': [DebugProtocol.SetFunctionBreakpointsArguments, DebugProtocol.SetFunctionBreakpointsResponse];
  'setVariable': [DebugProtocol.SetVariableArguments, DebugProtocol.SetVariableResponse];
  'source': [DebugProtocol.SourceArguments, DebugProtocol.SourceResponse];
  'stackTrace': [DebugProtocol.StackTraceArguments, DebugProtocol.StackTraceResponse];
  'stepBack': [DebugProtocol.StepBackArguments, DebugProtocol.StepBackResponse];
  'stepIn': [DebugProtocol.StepInArguments, DebugProtocol.StepInResponse];
  'stepInTargets': [DebugProtocol.StepInTargetsArguments, DebugProtocol.StepInTargetsResponse];
  'stepOut': [DebugProtocol.StepOutArguments, DebugProtocol.StepOutResponse];
  'terminate': [DebugProtocol.TerminateArguments, DebugProtocol.TerminateResponse];
  'terminateThreads': [DebugProtocol.TerminateThreadsArguments, DebugProtocol.TerminateThreadsResponse];
  'threads': [{}, DebugProtocol.ThreadsResponse];
  'variables': [DebugProtocol.VariablesArguments, DebugProtocol.VariablesResponse];
}

export interface DebugEventTypes {
  'breakpoint': DebugProtocol.BreakpointEvent;
  'capabilities': DebugProtocol.CapabilitiesEvent;
  'continued': DebugProtocol.ContinuedEvent;
  'exited': DebugExitEvent;
  'initialized': DebugProtocol.InitializedEvent;
  'loadedSource': DebugProtocol.LoadedSourceEvent;
  'module': DebugProtocol.ModuleEvent;
  'output': DebugProtocol.OutputEvent;
  'process': DebugProtocol.ProcessEvent;
  'stopped': DebugProtocol.StoppedEvent;
  'terminated': DebugProtocol.TerminatedEvent;
  'thread': DebugProtocol.ThreadEvent;
}

const standardDebugEvents = new Set<string>([
  'breakpoint',
  'capabilities',
  'continued',
  'exited',
  'initialized',
  'loadedSource',
  'module',
  'output',
  'process',
  'stopped',
  'terminated',
  'thread',
]);

export class DebugSessionConnection implements IDisposable {

  private sequence = 1;

  protected readonly pendingRequests = new Map<number, (response: DebugProtocol.Response) => void>();
  protected readonly connection: Promise<IWebSocket>;

  protected readonly requestHandlers = new Map<string, DebugRequestHandler>();

  protected readonly onDidCustomEventEmitter = new Emitter<DebugProtocol.Event>();
  readonly onDidCustomEvent: Event<DebugProtocol.Event> = this.onDidCustomEventEmitter.event;

  protected readonly toDispose = new DisposableCollection(
    this.onDidCustomEventEmitter,
    Disposable.create(() => this.pendingRequests.clear()),
    Disposable.create(() => this.emitters.clear()),
  );

  constructor(
    readonly sessionId: string,
    protected readonly connectionFactory: (sessionId: string) => Promise<IWebSocket>,
    protected readonly traceOutputChannel: OutputChannel | undefined,
  ) {
    this.connection = this.createConnection();
  }

  get disposed(): boolean {
    return this.toDispose.disposed;
  }

  dispose(): void {
    this.toDispose.dispose();
  }

  protected async createConnection(): Promise<IWebSocket> {
    if (this.disposed) {
      throw new Error('Connection has been already disposed.');
    } else {
      const connection = await this.connectionFactory(this.sessionId);
      connection.onClose((code, reason) => {
        // TODO: 处理connection的dispose
        this.fire('exited', { code, reason });
      });
      connection.onMessage((data) => this.handleMessage(data));
      return connection;
    }
  }

  protected allThreadsContinued = true;

  async sendRequest<K extends keyof DebugRequestTypes>(command: K, args: DebugRequestTypes[K][0]): Promise<DebugRequestTypes[K][1]> {
    const result = await this.doSendRequest(command, args);
    if (command === 'next' || command === 'stepIn' ||
      command === 'stepOut' || command === 'stepBack' ||
      command === 'reverseContinue' || command === 'restartFrame') {
      this.fireContinuedEvent((args as any).threadId);
    }
    if (command === 'continue') {
      const response = result as DebugProtocol.ContinueResponse;
      const allThreadsContinued = response && response.body && response.body.allThreadsContinued;
      if (allThreadsContinued !== undefined) {
        this.allThreadsContinued = result.body.allThreadsContinued;
      }
      this.fireContinuedEvent((args as any).threadId, this.allThreadsContinued);
      return result;
    }
    return result;
  }

  sendCustomRequest<T extends DebugProtocol.Response>(command: string, args?: any): Promise<T> {
    return this.doSendRequest<T>(command, args);
  }

  protected async doSendRequest<K extends DebugProtocol.Response>(command: string, args?: any): Promise<K> {
    const result = new Deferred<K>();

    const request: DebugProtocol.Request = {
      seq: this.sequence++,
      type: 'request',
      command,
      arguments: args,
    };

    this.pendingRequests.set(request.seq, (response: any) => {
      if (!response.success) {
        result.reject(response);
      } else {
        result.resolve(response);
      }
    });

    await this.send(request);
    return result.promise;
  }

  protected async send(message: DebugProtocol.ProtocolMessage): Promise<void> {
    const connection = await this.connection;
    const messageStr = JSON.stringify(message);
    if (this.traceOutputChannel) {
      this.traceOutputChannel.appendLine(`${this.sessionId.substring(0, 8)} [UI -> adapter]: ${messageStr}`);
    }
    connection.send(messageStr);
  }

  protected handleMessage(data: string) {
    if (this.traceOutputChannel) {
      this.traceOutputChannel.appendLine(`${this.sessionId.substring(0, 8)} [adapter -> UI ]: ${data}`);
    }
    const message: DebugProtocol.ProtocolMessage = JSON.parse(data);
    if (message.type === 'request') {
      this.handleRequest(message as DebugProtocol.Request);
    } else if (message.type === 'response') {
      this.handleResponse(message as DebugProtocol.Response);
    } else if (message.type === 'event') {
      this.handleEvent(message as DebugProtocol.Event);
    }
  }

  protected handleResponse(response: DebugProtocol.Response): void {
    const callback = this.pendingRequests.get(response.request_seq);
    if (callback) {
      this.pendingRequests.delete(response.request_seq);
      callback(response);
    }
  }

  onRequest(command: string, handler: DebugRequestHandler): void {
    this.requestHandlers.set(command, handler);
  }

  protected async handleRequest(request: DebugProtocol.Request): Promise<void> {
    const response: DebugProtocol.Response = {
      type: 'response',
      seq: 0,
      command: request.command,
      request_seq: request.seq,
      success: true,
    };
    const handler = this.requestHandlers.get(request.command);
    if (handler) {
      try {
        response.body = handler(request);
      } catch (error) {
        response.success = false;
        response.message = error.message;
      }
    } else {
      console.error('Unhandled request', request);
    }
    await this.send(response);
  }

  protected handleEvent(event: DebugProtocol.Event): void {
    if ('event' in event) {
      if (event.event === 'continued') {
        this.allThreadsContinued = (event as DebugProtocol.ContinuedEvent).body.allThreadsContinued === false ? false : true;
      }
      if (standardDebugEvents.has(event.event)) {
        this.doFire(event.event, event);
      } else {
        this.onDidCustomEventEmitter.fire(event);
      }
    } else {
      this.fire('exited', event);
    }
  }

  protected readonly emitters = new Map<string, Emitter<DebugProtocol.Event | DebugExitEvent>>();
  on<K extends keyof DebugEventTypes>(kind: K, listener: (e: DebugEventTypes[K]) => any): IDisposable {
    if (this.disposed) {
      return Disposable.create(() => {});
    }
    return this.getEmitter(kind).event(listener);
  }

  public fire<K extends keyof DebugEventTypes>(kind: K, e: DebugEventTypes[K]): void {
    this.doFire(kind, e);
  }

  protected doFire(kind: string, e: DebugProtocol.Event | DebugExitEvent): void {
    if (this.disposed) {
      return ;
    }
    this.getEmitter(kind).fire(e);
  }

  protected getEmitter(kind: string): Emitter<DebugProtocol.Event | DebugExitEvent> {
    const emitter = this.emitters.get(kind) || this.newEmitter();
    this.emitters.set(kind, emitter);
    return emitter;
  }

  protected newEmitter(): Emitter<DebugProtocol.Event | DebugExitEvent> {
    const emitter = new Emitter<DebugProtocol.Event | DebugExitEvent>();
    this.toDispose.push(emitter);
    return emitter;
  }

  protected fireContinuedEvent(threadId: number, allThreadsContinued = false): void {
    this.fire('continued', {
      type: 'event',
      event: 'continued',
      body: {
        threadId,
        allThreadsContinued,
      },
      seq: -1,
    });
  }

}
