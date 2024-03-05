import { HttpReqPost } from '@/core/trade';
import SWM_API, { RoomStatus, TradeStatus } from '@/services/swm/constants';
import { getConfigFromBroswer } from '@/utils';
import { message } from 'antd';
import { pick, prop } from 'lodash/fp';
import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import io from 'socket.io-client';

export enum ServerStatus {
  服务中,
  暂停服务,
  调试中,
  离线,
  在线,
}

const initialState = {
  status: ServerStatus.离线,
  total: 0,
  currentOrder: {} as Partial<SWM.Order>,
  roomStatus: RoomStatus.idle,
  devices: [] as MediaDeviceInfo[],
};

let socket: Socket;

export default function useSocketModel() {
  const [state, setState] = useState(() => {
    console.log('初始化全局状态');
    return initialState;
  });

  const [queryID, setQueryID] = useState('');

  const [medias, setMedias] = useState<MediaDeviceInfo[]>([]);

  const createConnection = () => {
    if (socket) {
      message.error('请勿重复创建链接');
      return;
    }

    socket = io('http://localhost/demo');
  };

  const disconnect = () => {
    if (socket) {
      socket.removeAllListeners();
      socket.close();
      socket.disconnect();
    }
  };

  /**
   * 变更房间状态
   * @param status 想让房间处于目标状态的状态参数
   */
  const changeRoomStatus = async (status: RoomStatus) => {
    let type = '';
    const params: Record<string, string> = {
      room_id: prop('term_id', getConfigFromBroswer(['term_id'])),
    };
    switch (status) {
      case RoomStatus.busy:
        type = SWM_API.房间恢复;
        break;
      case RoomStatus.idle:
        type = SWM_API.房间空闲;
        params.media_seq_no = state.currentOrder?.media_seq_no;
        break;
      case RoomStatus.pause:
        type = SWM_API.房间挂起;
        break;
      default:
        break;
    }
    const res = await HttpReqPost(type, params);
    if (res.header?.returnCode === TradeStatus.suc) {
      // 顺带的，要不要连当前房间信息也置空，如果是业务结束时
      // 目前已在 vtm 界面做了置空当前订单的操作
      setState(prev => ({ ...prev, roomStatus: status }));
      message.success('操作成功');
      return true;
    }

    return false;
  };

  /**
   * 监听
   * @param event
   * @param callback
   * @example
   *
   * on('join', res => {
   *   console.log('join事件：', res);
   * })
   *
   */
  const on: (event: string, listener: (...args) => void) => void = (event, callback) => {
    if (socket) {
      socket.removeListener(event);
      socket.on(event, callback);
    } else {
      console.warn(`监听 ${event} 事件需要初始化 socket 实例`);
    }
  };

  return {
    state,
    setState,
    createConnection,
    disconnect,
    on,
    /**
     * 用于触发表格查询的查询ID，该ID变更一次，表格查询一次
     * 用于：MQ 传递 change 消息通知查询，生成一次 uuid，触发查询
     */
    queryID,
    setQueryID,
    changeRoomStatus,
    medias,
    setMedias,
  };
}
