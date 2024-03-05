import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageLoading } from '@ant-design/pro-components';
import type { RequestConfig } from 'umi';
import { history } from 'umi';
import defaultSettings from '../config/defaultSettings';
// import HeaderTab from './components/HeaderTab';
// import { currentUser, currentUser as queryCurrentUser } from './services/ant-design-pro/api';
// import { TransitionGroup, CSSTransition } from 'react-transition-group';
// import { cloneElement, useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { notification } from 'antd';
// import styles from './app.less';
// import { GetGlobalData } from '@/core/global';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

const responseInterceptors1 = (response: Response, options: RequestConfig) => {
  // response.headers.append('interceptors', 'yes yo');

  return response;
};

//通讯配置
export const request: RequestConfig = {
  timeout: TRADE_TIMEOUT * 1000,
  errorConfig: {},
  middlewares: [
    async function Log(ctx, next) {
      await next();
      const header = `${ctx.req.url}${
        ctx.req.options.data.method ? `?${ctx.req.options.data.method}` : ''
      }`;
      window.IPCR.send('writeLog', {
        folder: ctx.req.options.data.method ? 'swm-seat-his' : 'swm-seat',
        content: `${header} 交易返回:\n${JSON.stringify(ctx.res)}`,
      });
    },
  ],
  requestInterceptors: [
    (url, options) => {
      window.IPCR.send('writeLog', {
        folder: options.data.method ? 'swm-seat-his' : 'swm-seat',
        content: `正在发起请求：${url}\n请求参数为：${JSON.stringify(options.data)}`,
      });

      return { url, options };
    },
  ],
  responseInterceptors: [responseInterceptors1],
  errorHandler: (error: any) => {
    // console.log(error);
    // console.log(error.data);
    if (error.name === 'BizError' || error.name === 'ResponseError') {
      notification.error({
        message: '交易失败',
        description: `${error.data.returnMsg ? error.data.returnMsg : error}`,
      });
      // return error;
      throw error;
    }
    notification.error({
      message: '网络故障',
      description: `${error.name}`,
    });

    throw error;
  },
};

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: SWM.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<SWM.CurrentUser | undefined>;
}> {
  // alert('getInitialState');

  // alert('getInitialState');
  // const fetchUserInfo = async () => {
  //   try {
  //     const msg = await queryCurrentUser();
  //     return msg.data;
  //   } catch (error) {
  //     history.push(loginPath);
  //   }
  //   return undefined;
  // };
  // alert('2');
  // 如果不是登录页面，执行
  if (history.location.pathname !== loginPath) {
    // alert('mmmnnn');
    // const currentUser = await fetchUserInfo();
    // userInfor.name='woo';
    return {
      // fetchUserInfo: async () => {
      //   return {
      //     name: 'woo2',
      //     group: 'a1'
      //   }
      // },
      // currentUser,
      // currentUser: {
      //   name: 'woo2',
      //   group: 'a1'
      // },
      settings: defaultSettings,
    };
  }
  return {
    // fetchUserInfo: async () => {
    //   return {
    //     name: 'woo2',
    //     group: 'a1'
    //   }
    // },
    // currentUser: {
    //   name: 'woo2',
    //   group: 'a1'
    // },
    settings: defaultSettings,
  };
}

const waterMark = (initialState: any, val: string) => {
  if (val === undefined || val === null) {
    return '';
  }

  if (isEmpty(val)) {
    return initialState?.currentUser?.name;
  }

  return val;
};

//菜单生成模式处理
//如果是生产环境：将通过交易获取到后台返回的菜单数据
//如果是开发环境：数据是routes.ts中的数据内容
const menu: any = () => {
  // const isDev: any = process.env.NODE_ENV === 'development';
  if (isDev) return null;

  console.log('MENU 动态处理');
  let menuData: any = null;

  if (GGMIDENDPRO?.GlobalData?.get()?.menu) {
    menuData = GGMIDENDPRO.GlobalData.get().menu[0].routes;
  }

  return () => menuData;
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
// export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
//   return {
//     //动态获取菜单配置处
//     menuDataRender: menu(),

//     rightContentRender: () => <RightContent />,
//     disableContentMargin: false,
//     waterMarkProps: {
//       // content: initialState?.currentUser?.name,
//       content: waterMark(initialState, `${WATERMARK}`),
//     },
//     // headerRender: () => <HeaderTab />,
//     // footerRender: () => <Footer />,

//     // 页面切换时的处理
//     onPageChange: () => {
//       const { location } = history;
//       // console.log(initialState.currentUser, 'onPageChange');
//       // 如果没有登录，重定向到 login
//       // if (!initialState.currentUser && location.pathname !== loginPath) {
//       //   // alert('->');
//       //   history.push(loginPath);
//       // }

//       // if (!GGMIDENDPRO.GlobalData || !GGMIDENDPRO.GlobalData.get()){
//       //   history.push(loginPath);
//       // }

//       if (!GGMIDENDPRO?.GlobalData?.get()) {
//         history.push(loginPath);

//         if (location.pathname !== '/user/login') {
//           notification.warn({
//             message: '登录失效',
//             // description: `${err.data.returnMsg ? err.data.returnMsg : err}`,
//             description: `请重新登录`,
//           });
//         }
//       }

//       // if (GGMIDENDPRO.GlobalData && GGMIDENDPRO.GlobalData.get()) {
//       //   setInitialState({
//       //     currentUser: GGMIDENDPRO.GlobalData.get(),
//       //     settings: defaultSettings
//       //   });
//       // }

//       if (GGMIDENDPRO?.GlobalData?.get()) {
//         setInitialState({
//           currentUser: GGMIDENDPRO.GlobalData.get(),
//           settings: defaultSettings,
//         });
//       }
//     },
//     // links: isDev
//     links: false
//       ? [
//           <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
//             <LinkOutlined />
//             <span>OpenAPI 文档</span>
//           </Link>,
//           <Link to="/~docs" key="docs">
//             <BookOutlined />
//             <span>业务组件文档</span>
//           </Link>,
//         ]
//       : [],
//     menuHeaderRender: undefined,

//     // 自定义 403 页面
//     // unAccessible: <div>unAccessible</div>,
//     // 增加一个 loading 的状态
//     childrenRender: (children, props) => {
//       // if (initialState?.loading) return <PageLoading />;
//       const [gLoading, setGLoading] = useState(false);
//       window.GGMIDENDPRO.GLoading = setGLoading;

//       useEffect(() => {
//         return () => {};
//       }, []);
//       return (
//         <Spin spinning={gLoading}>
//           {!props.location?.pathname?.includes('/login') && (
//             <>
//               {/* <HeaderTab /> */}
//               {/* <SettingDrawer
//                 disableUrlParams
//                 enableDarkTheme
//                 settings={initialState?.settings}
//                 onSettingChange={settings => {
//                   setInitialState(preInitialState => ({
//                     ...preInitialState,
//                     settings,
//                   }));
//                 }}
//               /> */}
//             </>
//           )}
//           {/* <TransitionGroup childFactory={child => cloneElement(child, { classNames: styles.dd })}>
//             <CSSTransition timeout={300}>{children}</CSSTransition>
//           </TransitionGroup> */}
//           {/* <div className={styles.dd}>
//             {children}
//           </div> */}
//           {children}
//         </Spin>
//       );
//     },
//     ...initialState?.settings,
//   };
// };
