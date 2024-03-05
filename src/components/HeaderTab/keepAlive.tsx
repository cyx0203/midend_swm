import { RouteContext } from '@ant-design/pro-components';
import type { FC, ReactNode } from 'react';
import { useContext } from 'react';
import { KeepAlive as RcKeepAlive } from 'umi';
import { last } from 'lodash/fp';

export interface KeepAliveProps {
  /** 持久化显示，不可关闭 */
  persistant?: boolean;
  name?: string;
  path?: string;
  children: ReactNode;
}

const KeepAlive: FC<KeepAliveProps> = props => {
  const { pageTitleInfo, matchMenuKeys } = useContext(RouteContext);

  const path = last(matchMenuKeys);

  return (
    <RcKeepAlive
      persistant={props.persistant}
      name={props.name ? props.name : pageTitleInfo?.pageName}
      path={props.path ? props.path : path}
      saveScrollPosition="screen"
    >
      {props.children}
    </RcKeepAlive>
  );
};

export default KeepAlive;
