const Settings: any = {
  //全局主标题
  MAIN_TITLE: '武汉协和医院超级窗',
  //版本号
  VERSION: 'Ver 1.0.1',
  /**
   * 服务地址，未在定制浏览器中，可用该环境变量
   * @deprecated 已交由浏览器提供，存在于vtm配置中，字段：base_url，标签：交易地址
   */
  BASE_URL: 'http://127.0.0.1:23129',
  // BASE_URL: 'http://192.168.1.105:',
  /**
   * his 服务地址，未在定制浏览器中，可用该环境变量
   * @deprecated 已交由浏览器提供，存在于vtm配置中，字段：his_url，标签：第三方地址
   */
  HIS_URL: 'http://192.168.1.104:8036',
  /** 院区映射 */
  HOS_MAP: [
    {
      // fyid: '1001',
      fyid: 'X001',
      fbid: '00',
      name: '本部',
    },
    {
      fyid: '1002',
      fbid: '00',
      name: '西院区',
    },
    {
      fyid: '1001',
      fbid: '01',
      name: '肿瘤中心',
    },
    {
      fyid: '1003',
      fbid: '00',
      name: '金银湖院区',
    },
  ],
  //交易超时时间(秒)
  TRADE_TIMEOUT: 5,
  //交易地址
  TRADE_URL: '',
  //水印内容[无需水印则配置为null,设置为空将显示登录账号内容]
  WATERMARK: '',
  //日志输出优化
  LOG_OPTIMIZE: false,
  //日志屏蔽
  LOG_FORBIDDEN: false,
  //❌ 是否要开启KV功能[暂时废弃]
  KEEPALIVE: true,
  //本地存储超时时间（单位：秒）1200s = 20min
  ST_TIMEOUT: 14 * 60 * 60,
  //环境标识
  ENV: '',
  //是否可绕过登录
  SIKP_LOGIN: false,
  //登录后跳转的默认页面
  LOGIN_SUCCESSOR_PAGE: '/welcome',
};

export default Settings;
