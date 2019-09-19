import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { useInjectable, URI } from '@ali/ide-core-browser';
import * as styles from './debug-stack-frames.module.less';
import { DebugStackFramesService } from './debug-stack-frames.service';

export const DebugStackFrameView = observer(() => {
  const {
    stackFrames,
  }: DebugStackFramesService = useInjectable(DebugStackFramesService);

  const renderStackFrames = (stackFrames) => {
    if (stackFrames) {
      return stackFrames.map((frame) => {
        const clickHandler = () => {
          if (frame && frame.source) {
            frame.source.open();
          }
        };
        return <div className={styles.debug_stack_frames_item} onClick={clickHandler}>
        <div className={styles.debug_stack_frames_item_label}>
          {frame.raw && frame.raw.name}
        </div>
        <div className={styles.debug_stack_frames_item_description}>
          {frame.raw && frame.raw.source && frame.raw.source.name }
        </div>
        <div className={styles.debug_stack_frames_item_badge}>
        {frame.raw && frame.raw.line}:{frame.raw && frame.raw.column}
        </div>
      </div>;
      });
    } else {
      return <div></div>;
    }
  };

  return <div className={styles.debug_stack_frames}>
    {renderStackFrames(stackFrames)}
  </div>;
});
