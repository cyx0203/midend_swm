import { getConfigFromBroswer } from '@/utils';
import { isArray } from 'lodash/fp';
import { request } from 'umi';
import type { RequestConfig } from 'umi';

const his_url = getConfigFromBroswer(['his_url']).his_url;
// const url = HIS_URL + '/SWMServer';
const url = his_url + '/SWMServer';

const requestConfig: RequestConfig = {};

// const request = umiRequest;

export enum MOPServerStatus {
  suc = '1',
}

export const Sex = {
  '1': '男',
  '2': '女',
  '9': '未知',
};

/** 在院状态 */
export const HosStatus = {
  '1': '待入科',
  '2': '在科已分床',
  '3': '医生开出院',
  '4': '护士执行出院',
  '5': '出院结算',
  '6': '转科中',
  '7': '取消住院',
  A: '注销',
};

enum RequestAPI {
  user = 'MOP_NetInHosPatientInfoQuery',
  payDetail = 'MOP_NetQueryOutpHosPay',
  fees = 'MOP_NetOutHosFeeDetailByFpQuery',
  feeMaster = 'MOP_NetInHosFeeMasterQuery',
  feeDetail = 'MOP_NetInHosFeeDetailQuery',
  chargeRecord = 'MOP_NetInHosChargeRecordQuery',
  payLock = 'MOP_NetOutpHosPayLock',
  payConfirm = 'MOP_NetOutpHosPayConfirm',
}

/**
 * 统一整合接口字段；
 * SBHIS 写代码不判空，导致返回数据充满不确定性。
 * @param res
 * @returns
 */
export function unifyParams<T>(res: MOP.Response<T>) {
  const { returnresult, data } = res;
  let _wrapper: T[] = [];

  if (data.data_row) {
    if (isArray(data.data_row)) {
      _wrapper = data.data_row;
    } else {
      _wrapper = [data.data_row];
    }
  } else {
    _wrapper = [data as T];
  }

  const _res = {
    returnresult,
    data: _wrapper.filter(Boolean),
  };

  window.IPCR.send('writeLog', {
    folder: 'swm-seat-his',
    content: `数据重组：${JSON.stringify(_res)}`,
  });

  return _res;
}

/**
 * 获取患者的住院信息
 * @param params
 * @returns
 */
export const fetchUserRecords = params => {
  return request<MOP.Response<MOP.UserRecord>>(url, {
    data: { ...params, method: RequestAPI.user },
    method: 'POST',
  });
};

/**
 * 查待缴费明细
 * @param params
 * @returns
 */
export const fetchRecordDetail = params => {
  return request<MOP.Response<MOP.PayDetail>>(url, {
    data: { ...params, method: RequestAPI.payDetail },
    method: 'POST',
  });
};

/**
 * 清单 - 明细发票汇总
 * @param params
 * @returns
 */
export const fetchFees = params => {
  return request<MOP.Response<MOP.Fees>>(url, {
    data: { ...params, method: RequestAPI.fees },
    method: 'POST',
  });
};

/**
 * 清单 - 在院清单主信息
 * @param params
 * @returns
 */
export const fetchFeeMaster = params => {
  return request<MOP.Response<MOP.FeeMaster>>(url, {
    data: { ...params, method: RequestAPI.feeMaster },
    method: 'POST',
  });
};

/**
 * 清单 - 在院清单明细
 * @param params
 * @returns
 */
export const fetchFeeDetail = params => {
  return request<MOP.Response<MOP.FeeDetail>>(url, {
    data: { ...params, method: RequestAPI.feeDetail },
    method: 'POST',
  });
};

/**
 * 缴款 - 预交记录查询
 * @param params
 * @returns
 */
export const fetchChargeRecord = params => {
  return request<MOP.Response<MOP.ChargeRecord>>(url, {
    data: { ...params, method: RequestAPI.chargeRecord },
    method: 'POST',
  });
};

/**
 * 结算 - 结算锁定
 * @param params
 * @returns
 */
export const fetchPayLock = params => {
  return request<MOP.Response>(url, {
    data: { ...params, method: RequestAPI.payLock },
    method: 'POST',
  });
};

/**
 * 结算 - 出院结算
 * @param params
 * @returns
 */
export const fetchPayConfirm = params => {
  return request<MOP.Response>(url, {
    data: { ...params, method: RequestAPI.payConfirm },
    method: 'POST',
  });
};
