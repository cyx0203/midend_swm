import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, message, Segmented } from 'antd';
import { history, useModel } from 'umi';
import { noop, pick, prop } from 'lodash/fp';
import { getConfigFromBroswer, uuid } from '@/utils';
import { useState } from 'react';
import { ServerStatus } from '@/models/socket';
import { HttpReqPost } from '../PageRoot';
import SWM_API, { RoomStatus, TradeStatus } from '@/services/swm/constants';
import { useRequest } from 'ahooks';

const _columns: ProColumns[] = [
  {
    title: '交易类型',
    /**
     * @date 2023-10-08
     * @description 交易类型的显示字段改成中文显示，取 trd_name 字段
     */
    // dataIndex: 'trd_type',
    dataIndex: 'trd_name',
    valueType: 'select',
    valueEnum: {
      DSL: '出院结算',
      DSL2: '入院登记',
    },
    align: 'center',
  },
  {
    title: '设备编号',
    dataIndex: 'swm_id',
    valueType: 'text',
    search: false,
    align: 'center',
  },
];

const omitted = pick(['hospital_id', 'job_id', 'level']);
const options = ['DSL 住院查询', 'DSL 出院办理'];

const snapProps = pick(['hospital_id']);
const orderProps = pick(['media_seq_no', 'swm_id', 'trd_type']);
const navigateMapper = {
  DLS: '/swm/vtm/chuyuanjiesuan',
  unknown: '/swm/vtm/unknown',
};

interface TBProps {
  afterQuery: (lens: number) => void;
  queryID: string;
}

export default function RaceTable(props: TBProps) {
  const { initialState } = useModel('@@initialState');
  const { state, queryID, setState, medias } = useModel('socket');
  const { currentUser } = initialState;

  const [query, setQuery] = useState(options[0]);

  const available = state.status === ServerStatus.在线;

  const { run, loading } = useRequest(
    args =>
      HttpReqPost(SWM_API.抢单, {
        ...args,
        ...snapProps(currentUser),
        room_id: prop('term_id', getConfigFromBroswer(['term_id'])),
      }),
    {
      manual: true,
      onSuccess: (res, args) => {
        console.log('接办成功:', args);
        if (res.header.returnCode === TradeStatus.suc) {
          const [params] = args;
          setState(prev => ({
            ...prev,
            currentOrder: params,
            roomStatus: RoomStatus.busy,
            status: ServerStatus.服务中,
          }));
          window.global_media_seq_no = params;
          /** 跳转到对应业务 */
          const path: string = navigateMapper[params.trd_type] || navigateMapper.unknown;
          history.push(path);
        }
      },
    },
  );

  const columns = _columns.concat([
    {
      title: '操作',
      render: (dom, record) => (
        <Button
          type="primary"
          disabled={!available}
          onClick={() => {
            console.log(medias);
            run(orderProps(record));
            // if (medias.length > 0) run(orderProps(record));
            // else message.warn('当前没有摄像头接入!');
          }}
          loading={loading}
        >
          接办
        </Button>
      ),
      search: false,
      align: 'center',
    },
  ]);

  return (
    <div style={{ minWidth: 530 }}>
      <header className="text-center mb-4 hidden">
        <Segmented options={options} value={query} onChange={v => setQuery(v as string)} />
      </header>
      <ProTable
        columns={columns}
        options={false}
        search={false}
        params={{ tradeType: query, _queryID: queryID }}
        rowKey="media_seq_no"
        pagination={{ pageSize: 5, position: ['bottomCenter'] }}
        request={async ({ pageSize, current, tradeType }) => {
          const res = await HttpReqPost(SWM_API.代办查询, {
            ...omitted(currentUser),
            room_id: prop('term_id', getConfigFromBroswer(['term_id'])),
            /**
             * @date 2023-10-08
             * @description 该字段按照接口文档，取消上送
             */
            // tradeType,
          });
          const l: any[] = res?.body?.list || [];
          props.afterQuery(l.length);
          setState(prev => {
            let s = prev.status;
            console.log('之前的状态：', s);
            switch (s) {
              case ServerStatus.离线:
                s = ServerStatus.在线;
              default:
                break;
            }
            console.log('现在状态：', s);
            return {
              ...prev,
              status: s,
            };
          });
          return {
            data: l,
          };
        }}
      />
    </div>
  );
}

RaceTable.defaultProps = {
  afterQuery: noop,
  queryID: uuid(),
};
