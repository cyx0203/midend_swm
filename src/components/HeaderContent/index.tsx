import { useModel } from 'umi';
import Field from '@ant-design/pro-field';
import { Badge, Divider, Popover } from 'antd';
import styles from './index.module.less';
import RaceTable from './table';
import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { useInterval, useTimeout } from 'ahooks';
import { uuid } from '@/utils';

const format = 'YYYY[年]MM[月]DD[日] HH:mm ddd';

export default function HeaderContent() {
  const { state, setState, queryID, setQueryID } = useModel('socket');
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState;

  const [now, setNow] = useState(moment().format(format));

  const [hovered, setHovered] = useState(true);

  useEffect(() => {
    window.IPCR.on('z-test-rerender', res => {
      console.log('来自 header-content 的监听：', res);
    });
  }, []);

  useEffect(() => {
    window.IPCR.send('MQ_OPEN');

    return () => window.IPCR.send('MQ_CLOSE');
  }, []);

  const handleMsgFromMQ = useCallback(
    (_, args) => {
      console.log('来自 MQ 的消息：', args);
      setQueryID(uuid());
    },
    [setQueryID],
  );

  useEffect(() => {
    window.IPCR.on('MQ_MSG', handleMsgFromMQ);

    return () => {
      console.log('MQ 监听销毁');
      window.IPCR.removeListener('MQ_MSG', handleMsgFromMQ);
    };
  }, [handleMsgFromMQ]);

  const handleHover = (show: boolean) => {
    setHovered(show);
  };

  useTimeout(() => {
    setHovered(false);
  }, 1000);

  useInterval(() => {
    setNow(moment().format(format));
  }, 1000);

  return (
    <section className="px-3 flex justify-between">
      <ul className="flex items-center flex-row pl-0">
        <li>
          <span>所在院区：{currentUser?.hospital_id}</span>
        </li>
        <Divider type="vertical" className={styles.mx} />
        <li>
          <span>服务状态：</span>
          <Field
            mode="read"
            valueEnum={{
              0: { text: '服务中', status: 'Processing' },
              1: { text: '暂停服务', status: 'Error' },
              2: { text: '调试中', status: 'Default' },
              3: { text: '离线', status: 'Error' },
              4: { text: '在线', status: 'Success' },
            }}
            value={state.status}
          />
        </li>
        <Divider type="vertical" className={styles.mx} />
        <li>
          <Badge count={state.total} offset={[10, 0]}>
            <Popover
              onOpenChange={handleHover}
              open={hovered}
              trigger="hover"
              defaultOpen
              content={
                <RaceTable
                  queryID={queryID}
                  afterQuery={n => setState(prev => ({ ...prev, total: n }))}
                />
              }
            >
              <a className="py-1 pr-4">待办业务</a>
            </Popover>
          </Badge>
        </li>
        {/* {state.status === ServerStatus.离线 && (
          <li className="ml-20">
            <Alert
              showIcon
              type="error"
              message="您似乎与 SWM 视频服务断了线，是否要尝试重连？"
              action={<a onClick={() => setQueryID(uuid())}>重连</a>}
            />
          </li>
        )} */}
      </ul>
      <div className="">{now}</div>
    </section>
  );
}
