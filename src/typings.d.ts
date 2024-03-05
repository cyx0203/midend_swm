declare module 'slash2';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module 'omit.js';
declare module 'numeral';
declare module '@antv/data-set';
declare module 'mockjs';
declare module 'react-fittext';
declare module 'bizcharts-plugin-slider';

// preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design Dedicated environment variable, please do not use it in your project.
declare let ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: 'site' | undefined;

declare const REACT_APP_ENV: 'test' | 'dev' | 'pre' | false;

interface Window {
  global_media_seq_no?: string;
  GGMIDENDPRO: {
    console?: Console;
    GlobalData?: any;
    GLoading?: any;
    GLoadingState?: any;
    GlobalData?: any;
  };
  z: {
    config: Broswer.Config;
  };
  IPCR?: {
    on: (event: string, callback: (e: any, res: any) => void) => void;
    send: (event: string, data?: any) => void;
    removeListener: (channel: string, listener: (...args: any[]) => void) => void;
  };
  /**
   * 仅在 vtm 界面可以使用。
   *
   * @description 用以暴露 vtm 界面内部函数交由外部调用；
   *
   * @todo
   * 因为不像具象的子组件，可以 ref 暴露出去，
   * 而是 children 遍历出来的，所以暂时没什么好的方法暴露出去；
   */
  startVTM: () => void;
  RTC_Client_Instance: GGRtcClient;
}

//appCfg.ts中定义的define变量
declare const MAIN_TITLE;
declare const VERSION;
/**
 * 服务基地址
 * @deprecated
 */
declare const BASE_URL: string;
declare const TRADE_URL;
declare const WATERMARK;
declare const LOG_OPTIMIZE;
declare const TRADE_TIMEOUT;
declare const LOG_FORBIDDEN;
declare const KEEPALIVE;
declare const ST_TIMEOUT;
declare const ENV;
declare const SIKP_LOGIN;
declare const LOGIN_SUCCESSOR_PAGE;

declare const GGMIDENDPRO;

/**
 * his 服务基地址
 * @deprecated
 */
declare const HIS_URL: string;
/** 院区映射 */
declare const HOS_MAP: MOP.HosMap[];

declare class GGRtcClient {
  join: () => void;
  leave: (callback?) => void;
}
