import {
  fetchChargeRecord,
  fetchFeeDetail,
  fetchFeeMaster,
  fetchFees,
  fetchPayConfirm,
  fetchPayLock,
  fetchRecordDetail,
  fetchUserRecords,
  HosStatus,
  MOPServerStatus,
  Sex,
  unifyParams,
} from '@/services/mop';
import {
  EditableProTable,
  ProForm,
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProList,
  ProPageHeader,
  ProTable,
} from '@ant-design/pro-components';
import type { EditableFormInstance } from '@ant-design/pro-components';
import { useBoolean, useRequest } from 'ahooks';
import { Button, Descriptions, Drawer, message, Modal, Result, Steps, Tabs } from 'antd';
import { eq, equals, gt, join, lt, map, pick, pipe, prop, T } from 'lodash/fp';
import { useEffect, useRef, useState } from 'react';
import { inc } from '@/utils';
import { FeeDetailColumns, FeeMasterColumns, _CashColumns, _ChargeColumns } from '../columns';
import clsx from 'classnames';
import { CheckCircleOutlined, CloudUploadOutlined } from '@ant-design/icons';
import ProField from '@ant-design/pro-field';
import styles from './index.module.less';
import { history, useModel } from 'umi';
import { RoomStatus } from '@/services/swm/constants';

type FormType = {
  cardType: string;
  cardNo: string;
  location: string;
};

const methods = ['就诊卡号', '住院号', '住院流水号', '姓名-身份证'];
const fyMapper = HOS_MAP.map(v => ({ ...v, label: v.name, value: v.fyid + v.fbid }));
const isMOPSucceed = equals(MOPServerStatus.suc);
const pickFyInfo = pick(['fyid', 'fbid']);
const toSplite = (key: string) => pipe(map(prop(key)), join(','));

interface IProps {
  expand: boolean;
  collapse: () => void;
  setOpen: () => void;
}

export default function Chuyuanjiesuan(props: IProps) {
  /** 左上角展开按钮 */
  const { expand } = props;
  // const [expand, setExpand] = useState(false);

  /** 查询用户列表的模态框 */
  const [userModal, { setTrue: openUserModal, setFalse: closeUserModal }] = useBoolean(false);
  /** 退费编辑行 key */
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  /** 预缴清单 */
  const [refoundTable, setRefoundTable] = useState<MOP.ChargeRecord[]>([]);
  /** 清单抽屉 */
  const [drawer, setDrawer] = useState(false);
  /** 住院结算模态框 */
  const [open, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  /** 住院结算步骤 */
  const [step, setStep] = useState(0);

  /** 病人个人信息，主要留存住院流水号 */
  const [description, setDescription] = useState<Partial<MOP.UserRecord>>({});
  /** 病人待缴费信息，主要判断是需要补款还是缴款 */
  const [recordDetail, setRecordDetail] = useState<Partial<MOP.PayDetail>>({});

  const [InfoForm] = ProForm.useForm<FormType>();
  const chargeForm = useRef<EditableFormInstance<MOP.ChargeRecord>>();

  const {
    state: { roomStatus },
  } = useModel('socket');

  useEffect(() => {
    return () => props.collapse();
  }, []);

  const { run: runRecordDetail } = useRequest(fetchRecordDetail, {
    manual: true,
    onSuccess: _res => {
      const res = unifyParams(_res);
      if (isMOPSucceed(res.returnresult.returncode)) {
        const [node] = res.data;
        node.needpay = +node.needpay;
        setRecordDetail(node);

        setRecordDetail(res.data as unknown as MOP.PayDetail);
      }
    },
  });

  const chargeColumns = _ChargeColumns.concat([
    {
      title: '退费金额',
      key: 'refound',
      dataIndex: 'refound',
      valueType: 'money',
      editable: T,
      initialValue: 0,
      formItemProps: {
        rules: [
          {
            validator: (_, v) => {
              const [currentEdit] = editableKeys;
              const { tranamount } = chargeForm.current.getRowData(currentEdit);
              if (v > +tranamount) {
                return Promise.reject(new Error('退费金额不能大于缴款金额'));
              }

              return Promise.resolve();
            },
          },
        ],
      },
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record, i, action) => (
        <a key="editable" onClick={() => action?.startEditable?.(record?.powertranid)}>
          编辑
        </a>
      ),
    },
  ]);

  /**
   *
   * @param mode '1'就诊卡，'2'住院流水号
   * @returns
   */
  const prepareRequestParams = (mode: '1' | '2' = '1') => {
    const { cardNo, location, cardType } = InfoForm.getFieldsValue();
    const fy = HOS_MAP.find(v => location === v.fyid + v.fbid);
    // 默认是以就诊卡查
    let querytype = `${inc(methods.indexOf(cardType))}`;
    let querynum = cardNo;
    // 后续的接口可以通过住院流水号查，保证结果唯一性；
    if (mode !== querytype) {
      querytype = mode;
      querynum = description?.zylsh;
    }
    return {
      querytype,
      querynum,
      ...(pickFyInfo(fy) as Omit<MOP.HosMap, 'name'>),
    };
  };

  const handleUserQuery = async fields => {
    const requestParams = {
      hisopernum: 'ZFBM',
      ...prepareRequestParams(),
    };
    try {
      const _res = await fetchUserRecords(requestParams);
      const res = unifyParams(_res);
      if (isMOPSucceed(res.returnresult.returncode)) {
        // setDescription(res.data.data_row as unknown as MOP.UserRecord);
        return {
          data: res.data,
        };
      }
    } catch (error) {
      message.error('网络异常');
      console.error('请求时出错', error.message);
    }
    return {
      data: [],
    };
  };

  const handleCashQuery = async ({ jslsh }) => {
    if (!jslsh) {
      return {
        data: [],
      };
    }
    const field = InfoForm.getFieldValue('location');
    const fy = HOS_MAP.find(v => field === v.fyid + v.fbid);
    const requestParams = {
      ...pickFyInfo(fy),
      jslsh,
      hisopernum: 'ZFBM',
    };
    const _res = await fetchFees(requestParams);
    const res = unifyParams(_res);
    if (isMOPSucceed(res.returnresult.returncode)) {
      return {
        data: res.data,
      };
    }
    return {
      data: [],
    };
  };

  /**
   * 预缴金额
   * @param param
   * @returns
   */
  const handleChargeQuery = async ({ jslsh }) => {
    if (!jslsh) {
      return {
        data: [],
      };
    }
    const requestParams = {
      hisopernum: 'ZFBM',
      ...prepareRequestParams(),
    };
    const _res = await fetchChargeRecord(requestParams);
    const res = unifyParams(_res);
    if (isMOPSucceed(res.returnresult.returncode)) {
      setRefoundTable(res.data.map(v => ({ ...v, refound: 0 })));
      return {
        data: res.data,
      };
    }
    return {
      data: [],
    };
  };

  const handleFeeMasterQuery = async () => {
    const requestParams = {
      hisopernum: 'ZFBM',
      ...prepareRequestParams(),
    };
    const _res = await fetchFeeMaster(requestParams);
    const res = unifyParams(_res);
    if (isMOPSucceed(res.returnresult.returncode)) {
      return {
        data: res.data,
      };
    }
    return {
      data: [],
    };
  };

  const handleFeeDetailQuery = async () => {
    const requestParams = {
      hisopernum: 'ZFBM',
      ...prepareRequestParams(),
    };
    const _res = await fetchFeeDetail(requestParams);
    const res = unifyParams(_res);
    if (isMOPSucceed(res.returnresult.returncode)) {
      return {
        data: res.data,
      };
    }
    return {
      data: [],
    };
  };

  const tabItems = [
    {
      key: 'summary',
      label: '汇总格式',
      children: (
        <ProTable
          columns={FeeMasterColumns}
          options={false}
          search={false}
          request={handleFeeMasterQuery}
        />
      ),
    },
    {
      key: 'detail',
      label: '明细格式',
      children: (
        <ProTable
          columns={FeeDetailColumns}
          options={false}
          search={false}
          request={handleFeeDetailQuery}
        />
      ),
    },
  ];

  const { run: runLock, data: lockRes } = useRequest(fetchPayLock, {
    manual: true,
    onSuccess: res => {
      console.log(`<------ 交易返回 ------`, res);
    },
  });

  const { run: runOutHos, loading: outHosLoading } = useRequest(fetchPayConfirm, {
    manual: true,
    onSuccess: res => {
      if (isMOPSucceed(res.returnresult.returncode)) {
        setStep(inc(step));
      } else {
        message.error(res.returnresult.errormsg);
      }
    },
  });

  const orderLock = async () => {
    const abs = Math.abs(recordDetail.needpay);
    const sum = refoundTable.reduce((acc, cur) => acc + cur.refound, 0);
    if (abs !== sum) {
      message.destroy();
      message.error('请检查退费金额是否满足差额');
      return;
    }
    openModal();
    const { fyid, fbid } = prepareRequestParams();
    const requestParams = {
      fyid,
      fbid,
      hisopernum: 'ZFBM',
      zylsh: description.zylsh,
    };
    runLock(requestParams);
  };

  const outHosCheck = () => {
    const { querynum } = prepareRequestParams('2');
    const requestParams = {
      zylsh: querynum,
      hisopernum: 'ZFBM',
      yjj_id_list: toSplite('powertranid')(refoundTable),
      yjj_amout_list: toSplite('refound')(refoundTable),
    };

    runOutHos(requestParams);
  };

  const onBack = () => {
    if (roomStatus === RoomStatus.busy) {
      message.destroy();
      message.error('请结束当前业务后再进行业务选择');

      return;
    }

    history.push('/swm/vtm');
  };

  const renderCashTBHeader = (
    <>
      <span className="mr-2">预缴金额</span>
      {+recordDetail?.needpay > 0 && (
        <span className="text-gray-500">
          仍需患者补款 <b className="text-red-500">{recordDetail?.needpay}</b> 元
        </span>
      )}
      {+recordDetail?.needpay < 0 && (
        <span className="text-gray-500 text-base">
          需退还患者 <b className="text-green-500">{recordDetail?.needpay}</b> 元
        </span>
      )}
    </>
  );

  return (
    <>
      <div className={clsx(styles.container, { [styles.expanded]: expand })}>
        <ProPageHeader
          prefixedClassName=""
          breadcrumb={null}
          onBack={onBack}
          extra={[
            <Button
              onClick={() => {
                props.setOpen();
                setDrawer(true);
              }}
              key="list"
              disabled={!description.zylsh}
            >
              清单
            </Button>,
            <Button disabled={!description.zylsh} danger key="confirm" onClick={orderLock}>
              结算
            </Button>,
          ]}
        />
        <section
          className={clsx(styles.form, 'grid gap-8', {
            [styles.expanded]: expand,
          })}
          id="aside-container"
        >
          <ProForm<FormType>
            layout="horizontal"
            className={clsx({
              'col-span-1': expand,
            })}
            initialValues={{
              cardType: methods[0],
              cardNo: '219935266',
              location: fyMapper[0].value,
            }}
            onFinish={async () => {
              openUserModal();
            }}
            form={InfoForm}
          >
            <ProForm.Group title="信息检索">
              <ProFormSelect width="md" label="所在院区" name="location" options={fyMapper} />
              <ProFormRadio.Group
                label="卡号类型"
                name="cardType"
                options={methods.map(v => ({ value: v, label: v }))}
              />
              <ProFormDependency name={['cardType']}>
                {({ cardType }) => {
                  return (
                    <ProFormText
                      rules={[{ required: true, message: `请正确输入${cardType}` }]}
                      name="cardNo"
                      label={`${cardType || ''}`}
                      required
                      width="md"
                    />
                  );
                }}
              </ProFormDependency>
            </ProForm.Group>
          </ProForm>
          <Descriptions
            colon
            column={3}
            title="病人信息"
            bordered
            className={clsx('col-span-3', { 'col-span-2': expand })}
          >
            <Descriptions.Item label="姓名">{description?.patientname}</Descriptions.Item>
            <Descriptions.Item label="性别">
              {description?.patientsex && (description?.patientsex === '1' ? '男' : '女')}
            </Descriptions.Item>
            <Descriptions.Item label="年龄">{description?.patientage}</Descriptions.Item>
            <Descriptions.Item label="就诊卡号" span={2}>
              {description?.jzkh}
            </Descriptions.Item>
            <Descriptions.Item label="性质">{description?.brxz}</Descriptions.Item>
            <Descriptions.Item label="账户余额" span={2}>
              {description?.hosbalance}
            </Descriptions.Item>
            <Descriptions.Item label="费用总额" span={2}>
              {description?.totalfee}
            </Descriptions.Item>
            <Descriptions.Item label="联系地址" span={3}>
              {description?.address}
            </Descriptions.Item>
            <Descriptions.Item label="联系方式" span={3}>
              {description?.phone}
            </Descriptions.Item>
          </Descriptions>
          <div className={clsx('grid col-span-3 grid-cols-5 gap-4')}>
            <ProTable
              headerTitle="现金类结算"
              options={false}
              columns={_CashColumns}
              search={false}
              params={{ jslsh: description?.zylsh }}
              request={handleCashQuery}
              pagination={{ position: ['bottomCenter'] }}
              className={clsx({ 'col-span-2': expand, 'col-span-5': !expand })}
            />
            <EditableProTable
              headerTitle={renderCashTBHeader}
              options={false}
              rowKey="powertranid"
              columns={chargeColumns}
              search={false}
              editableFormRef={chargeForm}
              params={{ jslsh: description?.zylsh }}
              request={handleChargeQuery}
              pagination={{ position: ['bottomCenter'] }}
              className={clsx({ 'col-span-3': expand, 'col-span-5': !expand })}
              recordCreatorProps={false}
              editable={{
                type: 'single',
                editableKeys,
                onSave: async (_, record) => {
                  // 更新一下原始数据，并做合计统计
                  setRefoundTable(prev =>
                    prev.map(v => (v.powertranid === record.powertranid ? record : v)),
                  );
                },
                onChange: setEditableRowKeys,
              }}
              toolBarRender={() => [
                <Button
                  icon={<CloudUploadOutlined />}
                  key="noty-other-btn"
                  type="primary"
                  disabled={!recordDetail?.needpay}
                >
                  发送给对方
                </Button>,
              ]}
              footer={records => {
                if (+recordDetail?.needpay > 0) {
                  return <span>当前已补款：0 元</span>;
                } else if (+recordDetail?.needpay < 0) {
                  const sum = refoundTable.reduce((acc, cur) => acc + cur.refound, 0);
                  const abs = Math.abs(recordDetail.needpay);
                  const isEq = eq(sum)(abs);
                  const isGt = gt(sum)(abs);
                  const isLt = lt(sum)(abs);
                  return (
                    <>
                      <span>
                        {isEq && <CheckCircleOutlined className="text-green-500 mr-2" />}
                        当前已选择退款总额：{sum} 元
                      </span>
                      {isGt && <span className="text-red-500 ml-4">请不要大于需退费总额</span>}
                      {isLt && <span className="text-green-500 ml-4">仍需退款 {abs - sum} 元</span>}
                    </>
                  );
                }

                return null;
              }}
            />
          </div>
        </section>
        <Modal
          title="请选择需办理业务的用户"
          footer={null}
          open={userModal}
          onCancel={closeUserModal}
          destroyOnClose
          width="40%"
        >
          <ProList
            request={handleUserQuery}
            metas={{
              title: {
                dataIndex: 'patientname',
              },
              content: {
                render: (_, record) => (
                  <ul className="flex justify-around">
                    <li>
                      <div className="text-gray-400">年龄</div>
                      <div>{record.patientage}</div>
                    </li>
                    <li>
                      <div className="text-gray-400">性别</div>
                      <div>{Sex[record.patientsex]}</div>
                    </li>
                    <li>
                      <div className="text-gray-400">在院状态</div>
                      <ProField mode="read" value={record.status} valueEnum={HosStatus} />
                    </li>
                  </ul>
                ),
              },
              actions: {
                render: (_, record) => (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    key="link"
                    onClick={() => {
                      setDescription(record);
                      runRecordDetail({ ...prepareRequestParams('2'), querynum: record?.zylsh });
                      closeUserModal();
                    }}
                  >
                    选择
                  </a>
                ),
              },
            }}
          />
        </Modal>
        <Drawer
          getContainer={false}
          maskClosable
          title="清单"
          open={drawer}
          onClose={() => setDrawer(!drawer)}
          style={{ marginTop: 0, marginBottom: 0 }}
          width="70%"
          destroyOnClose
        >
          <Tabs destroyInactiveTabPane items={tabItems} defaultActiveKey="summary" />
        </Drawer>
        <Modal
          title="结算流程"
          footer={null}
          open={open}
          onCancel={() => {
            /** 结算成功的时候关闭的话，清空掉当前信息 */
            if (step === 1) {
              setDescription({});
              setRecordDetail({});
              closeModal();
            } else {
              closeModal();
            }
          }}
        >
          <Steps current={step}>
            <Steps.Step title="结算锁定" />
            <Steps.Step title="出院办理" />
          </Steps>
          <div className="mt-4">
            {(() => {
              switch (step) {
                case 0:
                  return (
                    <Result
                      status={(() => {
                        if (isMOPSucceed(lockRes?.returnresult.returncode)) {
                          return 'success';
                        }
                        return 'info';
                      })()}
                      title={(() => {
                        if (lockRes?.returnresult.returncode) {
                          if (isMOPSucceed(lockRes?.returnresult.returncode)) {
                            return '锁定成功';
                          }

                          return lockRes.returnresult.errormsg;
                        }
                        return '正在锁单，请稍等...';
                      })()}
                      extra={[
                        <Button
                          loading={outHosLoading}
                          disabled={!isMOPSucceed(lockRes?.returnresult.returncode)}
                          key="next"
                          onClick={outHosCheck}
                        >
                          下一步
                        </Button>,
                      ]}
                    />
                  );
                case 1:
                  return (
                    <Result
                      status="success"
                      title="出院办理成功"
                      subTitle={`${description?.patientname} 的出院结算业务已完成，您可以关闭该窗口了`}
                    />
                  );
                default:
                  return null;
              }
            })()}
          </div>
        </Modal>
      </div>
    </>
  );
}
