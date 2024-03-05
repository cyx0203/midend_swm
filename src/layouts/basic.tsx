import type {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
} from '@ant-design/pro-layout';
import ProLayout from '@ant-design/pro-layout';
import React from 'react';
import { history, Link, useModel } from 'umi';
import RightContent from '@/components/RightContent';
import { isEmpty } from 'lodash';
import { message, notification } from 'antd';
import defaultSettings from '../../config/defaultSettings';
import HeaderContent from '@/components/HeaderContent';
import { RoomStatus } from '@/services/swm/constants';
import CustomBoundary from './errorCatcher';

export type BasicLayoutProps = {
  breadcrumbNameMap: Record<string, MenuDataItem>;
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
  settings: Settings;
} & ProLayoutProps;

window.addEventListener('error', function onError(e) {
  // Ignore ResizeObserver error
  if (e.message === 'ResizeObserver loop limit exceeded') {
    e.stopPropagation();
    e.stopImmediatePropagation();
  }
});

export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: Record<string, MenuDataItem>;
};

const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
  menuList.map(item => {
    return {
      ...item,
      children: item.children ? menuDataRender(item.children) : undefined,
    };
  });

const waterMark = (initialState: any, val: string) => {
  if (val === undefined || val === null) {
    return '';
  }

  if (isEmpty(val)) {
    return initialState?.currentUser?.name;
  }

  return val;
};

const loginPath = '/user/login';

const BasicLayout: React.FC<BasicLayoutProps> = props => {
  const {
    children,
    location = {
      pathname: '/',
    },
  } = props;

  const { initialState, setInitialState } = useModel('@@initialState');
  const {
    state: { roomStatus },
  } = useModel('socket');

  const handleNavigate = (to: string) => {
    if (roomStatus === RoomStatus.busy) {
      message.error('您正在服务中，请结束服务再进行操作');
    }
    history.push(to);
  };

  return (
    <ProLayout
      {...props}
      onMenuHeaderClick={() => history.push('/')}
      waterMarkProps={{
        content: waterMark(initialState, `${WATERMARK}`),
      }}
      headerContentRender={() => <HeaderContent />}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (
          menuItemProps.isUrl ||
          !menuItemProps.path ||
          location.pathname === menuItemProps.path
        ) {
          return defaultDom;
        }
        return <span onClick={() => handleNavigate(menuItemProps.path)}>{defaultDom}</span>;
      }}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: '主页',
        },
        ...routers,
      ]}
      itemRender={(route, params, routes, paths) => {
        const first = routes.indexOf(route) === 0;
        return first ? (
          <span onClick={() => handleNavigate(paths.join('/'))}>{route.breadcrumbName}</span>
        ) : (
          <span>{route.breadcrumbName}</span>
        );
      }}
      onPageChange={() => {
        const { location: l } = history;

        // window.RTC_Client_Instance?.leave(msg => {
        //   console.log('socket 断流', msg);
        // });

        if (!GGMIDENDPRO?.GlobalData?.get()) {
          // socket 断流
          window.RTC_Client_Instance?.leave(msg => {
            console.log('socket 断流', msg);
          });

          history.push(loginPath);

          if (l.pathname !== '/user/login') {
            notification.warn({
              message: '登录失效',
              description: `请重新登录`,
            });
          }
        }

        if (GGMIDENDPRO?.GlobalData?.get()) {
          setInitialState({
            currentUser: GGMIDENDPRO.GlobalData.get(),
            settings: defaultSettings,
          });
        }
      }}
      menuDataRender={menuDataRender}
      rightContentRender={() => <RightContent />}
      {...initialState.settings}
      id="children-container"
      ErrorBoundary={CustomBoundary}
    >
      {children}
    </ProLayout>
  );
};

export default BasicLayout;
