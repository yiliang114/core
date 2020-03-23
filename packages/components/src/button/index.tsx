import * as React from 'react';
import Dropdown from 'antd/lib/dropdown';
import classNames from 'classnames';
import 'antd/lib/dropdown/style/index.less';

import './style.less';
import { Icon, getDefaultIcon } from '../icon';

export type ButtonType = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link' | 'icon';

export type ButtonHTMLType = 'submit' | 'button' | 'reset';

export type ButtonSize = 'large' | 'default' | 'small';

interface IButtonBasicProps {
  type?: ButtonType;
  iconClass?: string;
  icon?: string;
  className?: string;
  loading?: boolean;
  ghost?: boolean;
  size?: ButtonSize;
  disabled?: boolean;
  block?: boolean;
}

interface MoreActionProps {
  more?: boolean;
  moreIconClass?: string;
  menu?: React.ReactNode;
}

export type ButtonProps = {
  htmlType?: ButtonHTMLType;
  onClick?: React.MouseEventHandler<HTMLElement>
} & IButtonBasicProps & MoreActionProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick'>;

const LoadingCircle = () => (
  <svg viewBox='0 0 1024 1024' focusable='false' className='kt-button-anticon-spin' data-icon='loading' width='1em' height='1em' fill='currentColor' aria-hidden='true'><path d='M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9 437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z'></path></svg>
);

function noop() { }

/**
 * @example
 * ```ts
 * <Button type='primary' | 'secondary' | 'ghost' | 'danger' | 'link' | 'icon'>click</Button>
 * // icon
 * <Button type='primary' icon='share'>click</Button>
 *
 * // or
 * <Button type='primary' iconClass=`${customPrefix} iconkey`>click</Button>
 *
 * // size
 * <Button size='large' | 'default' | 'small' type='primary' iconClass=`${customPrefix} iconkey`>click</Button>
 *
 * // more 点击后展开一个 dropdown
 * <Button more menu={(<div>
 *  <p>item1</p>
 *  <p>item1</p>
 *  </div>)}>click</Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  loading,
  className,
  type = 'primary',
  htmlType,
  size,
  ghost = false,
  onClick,
  disabled,
  block,
  iconClass,
  icon,
  more,
  moreIconClass,
  menu,
  title,
  ...otherProps
}) => {
  const classes = classNames('kt-button', className, {
    [`kt-${type}-button-loading`]: loading,
    [`ghost-${type}-button`]: ghost && !loading && type !== 'link',
    [`${type}-button`]: type,
    [`${size}-button-size`]: size,
    ['ghost-button']: ghost && type !== 'link',
    ['block-button']: block,
  });
  const iconClesses = classNames(className, {
    ['kt-clickable-icon']: !!onClick,
  });
  if (type === 'icon') {
    return <Icon tooltip={title} disabled={disabled} icon={icon} onClick={(loading || disabled) ? noop : onClick} className={iconClesses} iconClass={iconClass} />;
  }

  const iconNode = iconClass ? <Icon iconClass={iconClass} disabled={disabled} /> : null;

  if (more) {
    return (<Dropdown className={'kt-menu'} overlay={menu} trigger={['click']}>
      <button {...otherProps} disabled={disabled} className={classes} type={htmlType} onClick={(loading || disabled) ? noop : onClick}>
        {(loading && type !== 'link') && <LoadingCircle />}
        {iconNode && iconNode}
        {children}
        {more && <Icon iconClass={moreIconClass ? moreIconClass : getDefaultIcon('down')} className='kt-button-secondary-more' />}
      </button>
    </Dropdown>);
  }
  return (
    <button {...otherProps} disabled={disabled} className={classes} type={htmlType} onClick={(loading || disabled) ? noop : onClick}>
      {(loading && type !== 'link') && <LoadingCircle />}
      {iconNode && iconNode}
      {children}
    </button>
  );
};
