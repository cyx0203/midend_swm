import type { ProColumns } from '@ant-design/pro-components';
import { T } from 'lodash/fp';

export const _CashColumns: ProColumns<MOP.Fees>[] = [
  {
    title: '收费类别ID',
    key: 'sflxid',
    dataIndex: 'sflxid',
    hideInTable: true,
  },
  {
    title: '收费类别名称',
    key: 'sflxmc',
    dataIndex: 'sflxmc',
  },
  {
    title: '金额',
    key: 'je',
    dataIndex: 'je',
  },
];

export const _ChargeColumns: ProColumns<MOP.ChargeRecord>[] = [
  {
    title: '缴款日期',
    key: 'trandate',
    dataIndex: 'trandate',
    readonly: true,
  },
  {
    title: '收据号码',
    key: 'rcptno',
    dataIndex: 'rcptno',
    readonly: true,
  },
  {
    title: '缴款金额',
    key: 'tranamount',
    dataIndex: 'tranamount',
    readonly: true,
  },
  {
    title: '缴款方式',
    key: 'paytypelist',
    dataIndex: 'paytypelist',
    readonly: true,
  },
];

export const FeeMasterColumns: ProColumns<MOP.FeeMaster>[] = [
  {
    title: '入院日期',
    dataIndex: 'ryrq',
    key: 'ryrq',
  },
  {
    title: '病人姓名',
    dataIndex: 'patientname',
    key: 'patientname',
  },
  {
    title: '费用总额',
    dataIndex: 'totalamount',
    key: 'totalamount',
  },
  {
    title: '预交款总额',
    dataIndex: 'paytotalamount',
    key: 'paytotalamount',
  },
  {
    title: '余额',
    dataIndex: 'hosbalance',
    key: 'hosbalance',
  },
  {
    title: '自付合计金额',
    dataIndex: 'selfpay',
    key: 'selfpay',
  },
  {
    title: '发票类别名称',
    dataIndex: 'fplbmc',
    key: 'fplbmc',
  },
  {
    title: '发票类别总金额',
    dataIndex: 'fplbtotalje',
    key: 'fplbtotalje',
  },
];

export const FeeDetailColumns: ProColumns<MOP.FeeDetail>[] = [
  {
    title: '记账日期',
    dataIndex: 'jzrq',
    key: 'jzrq',
  },
  {
    title: '费用名称',
    dataIndex: 'xmmc',
    key: 'xmmc',
  },
  {
    title: '单位',
    dataIndex: 'unit',
    key: 'unit',
  },
  {
    title: '项目单价',
    dataIndex: 'xmdj',
    key: 'xmdj',
  },
  {
    title: '项目数量',
    dataIndex: 'xmsl',
    key: 'xmsl',
  },
  {
    title: '项目总额',
    dataIndex: 'xmje',
    key: 'xmje',
  },
  {
    title: '执行科室',
    dataIndex: 'zxks',
    key: 'zxks',
  },
];
