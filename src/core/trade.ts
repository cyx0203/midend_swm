// 各类通讯类

import { getConfigFromBroswer } from '@/utils';
import { notification } from 'antd';
import { request } from 'umi';
// import { notification } from 'antd';
const base_url = getConfigFromBroswer(['base_url']).base_url;

const HttpBase = async (
  type: 'POST' | 'GET',
  api: string,
  params: any = {},
  config: any = null,
) => {
  // let state: any = 0;
  // let errMsg: any = null;
  let baseUrl: string = base_url;

  if (!window.z && process.env.NODE_ENV === 'development') {
    baseUrl = BASE_URL;
  }

  //额外手动配置
  if (config) {
    if (config.baseUrl) baseUrl = config.baseUrl;
  }
  const url: string = `${baseUrl}${api}`;
  console.log(`TradeUrl:${url}`);
  const timestamp = Date.now();
  console.log(`TimeStamp:${timestamp}`);
  const result = await request(url, {
    method: type,
    headers: {
      'Content-Type': 'application/json',
    },
    // data: params,
    // data: {
    //   accessToken: '10000000000000001',
    data: {
      header: {
        timestamp,
      },
      body: params,
      // },
    },
  }).catch((err: any) => {
    console.log('trade error');
    // errMsg = err.message;
    // state = 1;
  });
  // console.log(result);
  if (result.header.returnCode === '0') {
  } else {
    // alert('1');
    notification.error({
      message: `交易失败-${result.header.returnCode}`,
      description: `${result.header.returnMsg}`,
    });
  }

  console.log('---------->');
  return result;
  // return {
  //   state: state,
  //   result: result,
  //   errMsg: errMsg,
  // };
};

/**
 * HTTP交易发起
 * [::Use Example::] import { HttpReq } from '@/core/trade';
 * @param api ……接口
 * @param config ……交易配置（非必要配置）
 */
const HttpReqPost = async (api: string, params: Record<string, any> = {}, config: any = null) => {
  return HttpBase('POST', api, params, config) as Promise<SWM.Response>;
};

const HttpReqGet = async (api: string, params: any = {}, config: any = null) => {
  return HttpBase('GET', api, params, config);
};

const AjaxBase: any = (
  type: string,
  api: string,
  params: any = {},
  scallback: Function,
  fcallback: Function,
  config: any = null,
) => {
  window.GGMIDENDPRO.GLoadingState = true;
  window.GGMIDENDPRO.GLoading(true);
  // let baseUrl: string = BASE_URL;
  let baseUrl = base_url;

  if (!window.z.config && process.env.NODE_ENV === 'development') {
    baseUrl = BASE_URL;
  }

  //额外手动配置
  if (config) {
    if (config.baseUrl) baseUrl = config.baseUrl;
  }
  //交易地址整合拼接
  const url: string = `${baseUrl}${api}`;
  request(url, {
    method: `${type}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  })
    .then((data: any) => {
      // console.log('then->>>>');
      // console.log(data);
      if (scallback) scallback(data);
    })
    .catch((err: any) => {
      console.log('Ajax Base catch');
      console.log(err);
      // console.log(err.response.status);
      // notification.error({
      //   message: '交易失败',
      //   // description: `${err.data.returnMsg ? err.data.returnMsg : err}`,
      //   description: `${err}`,
      // });
      if (fcallback) fcallback(err);
    })
    .finally(() => {
      console.log('🚀 总是执行了');
      window.GGMIDENDPRO.GLoadingState = false;
      window.GGMIDENDPRO.GLoading(false);

      //以下为模拟调试使用
      // setTimeout(() => {
      // window.GGMIDENDPRO.GLoadingState = false;
      //   window.GGMIDENDPRO.GLoading(false);
      // }, 3000);
    });
};

/**
 * 戻り地獄のAjax方法
 */
const Ajax: any = {
  Post: (...params) => {
    AjaxBase('post', ...params);
  },
  Get: (...params) => {
    AjaxBase('post', ...params);
  },
};

export { HttpReqPost, HttpReqGet, Ajax };
