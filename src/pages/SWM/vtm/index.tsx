import { useEffect, useState, useRef, Children, cloneElement } from 'react';
import type { ReactElement, ReactNode, MouseEvent } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { getConfigFromBroswer, toFixed } from '@/utils';
import Field from '@ant-design/pro-field';
import { Button, Descriptions, Statistic, Select, Form, message, Row, Tooltip } from 'antd';
import styles from './index.module.less';
import clsx from 'classnames';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import GGRtcClient from '@/core/GGRtcClient-1.3.0.js';
import { useBoolean, useRequest, useTimeout } from 'ahooks';
import { history, useLocation, useModel } from 'umi';
import { RoomStatus } from '@/services/swm/constants';
import { ServerStatus } from '@/models/socket';
import { HttpReqPost } from '@/core/trade';
import { groupBy } from 'lodash';

const videoCovers = [
  {
    id: 'rtcA',
    poster: './assets/poster.jpg',
  },
  {
    id: 'rtcB',
    poster: './assets/poster.jpg',
  },
  {
    id: 'rshare',
    poster: './assets/poster2.jpg',
  },
];

/** 是否需要内嵌业务菜单 */
const BUSINESS_MENU_REQUIRED = false;

function VTM(props: { children?: ReactNode }) {
  const { changeRoomStatus, state, setState: updateSocket, medias, setMedias } = useModel('socket');

  // 控制vtm视频开关
  const [isVTM, setVTM] = useState(false);
  const Option = Select.Option;

  const location = useLocation();

  /** 抽屉展开 */
  const [open, { toggle, setTrue: setOpen, setFalse: collapse }] = useBoolean(false);

  const [operateState, setOpe] = useState(true);

  //在线用户数据列表
  const [onlineUsers, setOnlineUsers] = useState<any>([]);
  //摄像头
  const [vdSource, setVdSource] = useState<any[]>([]);
  //帧率
  const [frame, setFrame] = useState<any[]>(['15', '20', '25', '30', '60']);
  //码率
  const [bitRate, setBitRate] = useState<any[]>(['unlimited', '2000', '1000', '500', '250', '125']);

  //进度
  // const [luploadProgress, setluploadP] = useState('');
  // const [ruploadProgress, setruploadP] = useState('');

  // //摄像头
  // const [micSource, setMicSource] = useState<Array<any>>([]);
  // const [isshare, setIsshare] = useState(false);
  // const [calleeUserName, setCalleeUserName] = useState<any>('');
  // const [callerUserName, setCallerUserName] = useState<any>('');

  const [resvRate, setResvRate] = useState<any>('N/A');
  const [sendRate, setSendRate] = useState<any>('N/A');

  // 是否可以结束视频录制
  // const canStop

  const rtcClient = useRef(null);
  const g_constraints: any = useRef({ audio: true, video: true });
  //当前使用的摄像头分辨率
  const g_currentPixel: any = useRef('');
  //当前帧率
  const g_currentFrameRate: any = useRef('15');
  //当前麦克风设备id
  const g_currentAudioID: any = useRef('');
  //当前摄像头设备id
  const g_currentVideoID: any = useRef('');
  //是否进入了房间
  const g_isJoinRoom = useRef(false);
  //当前用户是否在通话中
  const g_isCalling = useRef(false);

  //房间号
  const g_roomId: any = useRef('room1');
  //用户名
  const g_userName: any = useRef('');
  //被叫的用户名
  const g_calleeUserName: any = useRef('');

  //标记Form
  const [formRef] = Form.useForm();

  //静音和静视
  // const [muteAudio, setmAudio] = useState(false);
  // const [muteVideo, setmVideo] = useState(false);

  const resetPoster = () => {
    try {
      setTimeout(() => {
        videoCovers.forEach(v => {
          const node = document.getElementById(v.id) as HTMLVideoElement;
          node.poster = v.poster;
        });
      }, 1000);
    } catch (error) {
      console.log('重设封面时遇到问题：', error);
    }
  };

  // 下载本地视频
  const DOWNLOAD_LOCAL_VD = () => {
    if (!rtcClient.current) return;
    rtcClient.current.saveLocalRecord(`${window.global_media_seq_no.media_seq_no}_local`);
  };

  // 录制本地视频
  const REC_LOCAL_VD = flag => {
    console.error('REC_LOCAL_VD', flag);
    message.destroy();
    if (!g_isCalling.current) {
      message.error('请先建立视频会话');
      return;
    }
    if (flag === true) {
      console.log('test:', window.global_media_seq_no.media_seq_no);

      rtcClient.current.startLocalRecord();
      window.IPCR.send('writeLog', { folder: 'web', content: `终端:开始录制本地视频...` });
      // alert('开始录制本地');
      // recTag.current = true;
    } else {
      console.error('结束录制本地');
      // alert('结束录制本地');
      rtcClient.current.stopLocalRecord();
      window.IPCR.send('writeLog', { folder: 'web', content: `终端:结束录制本地视频...` });
      // alert('下载本地');
      DOWNLOAD_LOCAL_VD();
      window.IPCR.send('writeLog', { folder: 'web', content: `终端:下载本地视频...` });
      // recTag.current = false;
    }
  };

  // 下载远程视频
  const DOWNLOAD_REMOTE_VD = () => {
    if (!rtcClient.current) return;
    rtcClient.current.saveRemoteRecord(`${window.global_media_seq_no.media_seq_no}_remote`);
  };

  // 录制远程视频
  const REC_REMOTE_VD = flag => {
    message.destroy();
    if (!g_isCalling.current) {
      message.error('请先建立视频会话');
      return;
    }

    if (flag === true) {
      // $("#btn_recLocal")[0].innerHTML = "停止录制本地视频";
      rtcClient.current.startRemoteRecord();
      window.IPCR.send('writeLog', { folder: 'web', content: `终端:开始录制远程视频...` });
      // recRemoteTag.current = true;
      // alert('开始录制远程');
    } else {
      // $("#btn_recLocal")[0].innerHTML = "录制本地视频";
      rtcClient.current.stopRemoteRecord();
      window.IPCR.send('writeLog', { folder: 'web', content: `终端:结束录制远程视频...` });

      DOWNLOAD_REMOTE_VD();
      window.IPCR.send('writeLog', { folder: 'web', content: `终端:下载远程视频...` });
      // recRemoteTag.current = false;
      // alert('结束录制远程');
    }
  };

  // 下载远程分享视频
  const DOWNLOAD_REMOTESHARE_VD = () => {
    if (!rtcClient.current) return;
    rtcClient.current.saveRemoteShareRecord(
      `${window.global_media_seq_no.media_seq_no}_remoteshare`,
    );
  };

  // 录制远程分享视频
  const REC_REMOTESHARE_VD = flag => {
    message.destroy();
    if (!g_isCalling.current) {
      message.error('请先建立视频会话');
      return;
    }

    if (flag === true) {
      // $("#btn_recLocal")[0].innerHTML = "停止录制本地视频";
      rtcClient.current.startRemoteShareRecord();
      window.IPCR.send('writeLog', { folder: 'web', content: `终端:开始录制远端分享视频...` });
      // recRemoteShareTag.current = true;
      // alert('开始录制分享');
    } else {
      // $("#btn_recLocal")[0].innerHTML = "录制本地视频";
      rtcClient.current.stopRemoteShareRecord();
      window.IPCR.send('writeLog', { folder: 'web', content: `终端:结束录制远端分享视频...` });

      DOWNLOAD_REMOTESHARE_VD();
      window.IPCR.send('writeLog', { folder: 'web', content: `终端:下载远端分享视频...` });
      // recRemoteShareTag.current = false;
      // alert('结束录制分享');
    }
  };

  const options: any = useRef({
    // userId: `${g_userName.current}`,            // 用户id
    // roomId: `${g_roomId.current}`,            // 房间号
    userId: ``, // 用户id
    roomId: ``,
    cameraId: '', // 当前摄像头id（如果不传，则取系统默认值）
    microphoneId: '', // 当前麦克风id（如果不传，则取系统默认值）

    // 设置本地和远程视频播放的dom-video的id
    local_stream_play_video: 'rtcA',
    remote_stream_play_video: 'rtcB',
    // 分享流播放的dom-video的id
    remote_share_stream_play_video: 'rshare',

    // 音视频约束参数（重要）
    constraints: g_constraints.current,

    // 信令服务器地址
    // SignalServerAddr : "http://127.0.0.1:3000",
    // SignalServerAddr: 'https://127.0.0.1:8443',

    //238服务器地址
    // SignalServerAddr: "https://wx.ggzzrj.cn:8443",
    // SignalServerAddr: 'https://192.168.2.234:8443',
    SignalServerAddr: getConfigFromBroswer(['remoteUrl']).remoteUrl, // 本地

    // 上传音视频文件的服务端URL
    uploadServerURL: 'https://ggplat.ggzzrj.cn/hbjx-wxplatpro/wxplatpro/UploadWebRtcVideo.do',

    // 是否禁用视频(false或不配置，则不禁用) （默认false）
    muteVideo: false,
    // 是否禁用流量监控（默认false）
    disableRateMonitor: false,

    // 绑定回调函数
    callback: {
      // ================== 其他人加入房间通知 ==================
      onAnotherUserJoin: (account: any, userlist: any) => {
        // console.log(account);
        // console.log(userlist);
        setOnlineUsers(userlist);
        message.destroy();
        message.warn(`SWM设备 [${account}] 发起了远程协助`);
      },

      // ================== 群发送消息通知 ==================
      onBroadcastMsg: (data: any) => {},

      // ================== 其他人离开房间通知 ==================
      onAnotherUserLeave: (account: any, userlist: any) => {
        setOnlineUsers(userlist);
        message.destroy();
        message.warn(`SWM设备 [${account}] 结束了远程协助`);

        updateSocket(prev => ({ ...prev, roomStatus: RoomStatus.idle, status: ServerStatus.在线 }));
        // resetPoster();
      },

      // ================== （被呼叫端）收到呼叫请求消息 ==================
      onCall: (data: any, isCalling: any) => {
        console.log('onCall', data); // 格式： {roomid: "room1", callee: "user_17", caller: "user_84"}
        console.log('isCalling', isCalling); // 当前是否正在视频会话中，true-是，false-否
        try {
          if (isCalling) {
            // 判断自己是否在通话中
            console.log('收到呼叫，但当前已经处在通话中');
            data.replyCode = 3; // 发送响应（状态码为3，表示在通话中）
            return;
          }

          console.log('同意');
          g_isCalling.current = true; // 保存到全局变量
          data.replyCode = 1; // 发送响应（状态码为1，表示同意）

          // if (confirm('终端: ' + data.caller + ' 向你发起远程协助, 是否同意?')) {
          //   console.log('同意');
          //   g_isCalling.current = true; // 保存到全局变量

          //   data.replyCode = 1; // 发送响应（状态码为1，表示同意）
          // } else {
          //   console.log('拒绝');
          //   data.replyCode = 2; // 发送响应（状态码为2，表示拒绝）
          // }
        } finally {
          window.IPCR.send('writeLog', {
            folder: 'web',
            content: `### Step2:坐席端同意视频请求 ###`,
          });
          console.log('准备发送reply响应');
          rtcClient.current.reply(data); // 主动发送回应(给呼叫端)
        }
      },

      // ================== （呼叫端）收到被呼叫端请求响应消息 ==================
      onReply: (data: any, isCalling: any) => {
        console.log('onReply', data); // {roomid: "room1", callee: "user_85", caller: "user_9", replyCode: 1}
        console.log('isCalling', isCalling); // 是否正在视频会话中，true-是，false-否
        if (onlineUsers.length > 1) g_isCalling.current = isCalling; // 保存到全局变量
      },

      // ================== 视频P2P握手连接完成 ==============================
      onP2PConnectCompleted: () => {
        console.log('视频P2P握手连接完成...');

        console.log('开启码率设置功能');
        // $('#bandwidth').attr("disabled", false);  // 在P2P对接成功后设置

        window.IPCR.send('writeLog', {
          folder: 'web',
          content: `### Step3:坐席端P2P握手连接完成,正在连接通话 ###`,
        });

        REC_LOCAL_VD(true); // 录制本地视频
        REC_REMOTE_VD(true); // 录制远端视频
        // REC_REMOTESHARE_VD(true);
      },

      // ================== 收到远端静音/视消息 ==================
      onRemoteMute: (data: any, isCalling: any) => {
        message.destroy();
        console.log('收到远端静音/视消息...', data, isCalling);
        const remote = data.from;
        message.warn(
          '对方' +
            (data.op === 'mute' ? '开启' : '关闭') +
            (data.type === 'audio' ? '静音' : '静视'),
        );
      },

      // ================== 收到远端切换摄像头消息 ==================
      onRemoteChangeCamera: (data: any, isCalling: any) => {
        console.log('收到远端切换摄像头消息...', data, isCalling);
        message.destroy();
        message.warn('收到远端切换摄像头消息...');
      },

      // ================== 收到远端视频会话挂断消息 ==================
      onRemoteHandup: (data: any, isCalling: any) => {
        console.log('收到远端视频会话挂断消息...', data, isCalling);
        message.destroy();
        message.warn('收到远端视频会话挂断消息...');

        console.log('关闭码率设置功能');
        // $('#bandwidth').attr("disabled", true);

        REC_LOCAL_VD(false); // 录制本地视频
        REC_REMOTE_VD(false); // 录制远端视频
        REC_REMOTESHARE_VD(false);
        g_isCalling.current = false;
        setOpe(true);
      },

      // ================== 收到远端用户断线消息 ==================
      onRemoteDisconnect: (roomid: any, disconnect_user: any, userlist: any) => {
        console.log('收到远端用户断线消息...');

        console.log('会话状态标志 => false');

        message.destroy();
        message.warn(`收到远程终端[ ${disconnect_user} ]断线消息...`);

        setOnlineUsers(userlist);

        updateSocket(prev => ({ ...prev, roomStatus: RoomStatus.idle, status: ServerStatus.在线 }));

        REC_LOCAL_VD(false); // 录制本地视频
        REC_REMOTE_VD(false); // 录制远端视频
        REC_REMOTESHARE_VD(false);
        g_isCalling.current = false;
        setOpe(true);
      },

      // 码率数据事件（每隔一秒回调）
      onStreamRate: (sendRates: any, resvRates: any) => {
        setSendRate(sendRates);
        setResvRate(resvRates);
        // console.log('视频速率监控：');
        // console.log(sendRate);
        // console.log(resvRate);
      },

      // ================== webSocket连接断线处理 ==================
      onDisconnect: () => {
        console.log('webSocket连接断线...');
        window.IPCR.send('writeLog', { folder: 'web', content: `座席端webSocket连接断线...` });
        // updateSocket(prev => ({ ...prev, roomStatus: RoomStatus.idle, status: ServerStatus.在线 }));
        // setOpe(true);
        REC_LOCAL_VD(false); // 录制本地视频
        REC_REMOTE_VD(false); // 录制远端视频
        REC_REMOTESHARE_VD(false);
        g_isCalling.current = false;
        g_isJoinRoom.current = false;
        rtcClient.current = null;
      },
      // ================== peer_disconnected连接断线处理 ==================
      peer_disconnected: () => {
        console.log('peer_disconnected连接断线...');
        window.IPCR.send('writeLog', {
          folder: 'web',
          content: `座席端peer_disconnected连接断线...`,
        });
        // updateSocket(prev => ({ ...prev, roomStatus: RoomStatus.idle, status: ServerStatus.在线 }));
        // setOpe(true);
        REC_LOCAL_VD(false); // 录制本地视频
        REC_REMOTE_VD(false); // 录制远端视频
        REC_REMOTESHARE_VD(false);
        g_isCalling.current = false;
        g_isJoinRoom.current = false;
        rtcClient.current = null;
      },
      // ================== onConnect连接成功 ==================
      onConnect: () => {
        console.log('onConnect连接成功...');
        window.IPCR.send('writeLog', { folder: 'web', content: `座席端onConnect连接成功...` });
        JOIN_ROOM();
      },
    },
  });

  // 加入房间
  const JOIN_ROOM = () => {
    message.destroy();
    options.current.roomId = g_roomId.current;
    options.current.userId = g_userName.current;
    // 初始化RTCClient对象
    if (!rtcClient.current) {
      console.log('进入了rtcClient.current分支');
      try {
        rtcClient.current = new GGRtcClient(options.current);
        window.RTC_Client_Instance = rtcClient.current;

        rtcClient.current.join((result: any) => {
          // 打印加入房间后服务端返回的信息
          // {"code":0,"msg":"enter successful","room":"room1","accounts":[{"account":"user_32860","id":"ttT5-gWXY0wBpcKbAAAH"}]}
          // console.log("加入房间的执行结果: " + JSON.stringify(result));

          console.log(':: JOIN ROOM ::');
          console.log(result);
          if (result.code == 0) {
            window.IPCR.send('writeLog', {
              folder: 'web',
              content: `### Step1:坐席端加入房间成功 ###`,
            });
            console.log('进入房间标志');
            // 进入房间标志
            g_isJoinRoom.current = true;
            // message.info('成功进入房间');
            setOnlineUsers(result.accounts);
          } else {
            message.error(result.msg);
          }
        });
      } catch (error) {
        console.warn((error as Error).message);
        message.warn(error.message);
      }
    }
  };

  const update_g_constraints = () => {
    if (!g_currentAudioID.current || !g_currentVideoID.current) return;

    g_constraints.current = {
      audio: { deviceId: g_currentAudioID.current },
      video: { deviceId: g_currentVideoID.current },
    };

    if (g_currentPixel.current) {
      // 格式：640x480
      g_constraints.current.video.width = g_currentPixel.current.split('x')[0];
      g_constraints.current.video.height = g_currentPixel.current.split('x')[1];
    }
    g_constraints.current.video.frameRate = { ideal: g_currentFrameRate.current, max: 24 }; // 帧率
    console.log('g_constraints', g_constraints.current);

    // 如果初始化了GGRtcClient，则务必要更新
    if (rtcClient.current) {
      console.log('更新rtcClient的_constraints');
      rtcClient.current._constraints = g_constraints.current;
    }
  };

  const listEnumerateDevices = () => {
    const getDeviceListCB: any = (deviceArray: any) => {
      // 列举媒体设备
      console.log('========== 列举媒体设备 ===========');

      console.log(deviceArray);

      const vdList: any = [];
      const micList: any = [];
      // 分别将音频和视频设备添加到下拉框
      deviceArray.forEach((device: any) => {
        console.log('Device:', device);
        const [kind, type, direction] = device.kind.match(/(\w+)(input|output)/i); // kind不可删除
        if (type == 'audio' && direction == 'input') {
          micList.push({ value: device.deviceId, text: device.label });
        } else if (type == 'video' && direction == 'input') {
          vdList.push({ value: device.deviceId, text: device.label });
        }
      });
      formRef.setFieldsValue({ vd: vdList[0] ? vdList[0].text : '' });
      formRef.setFieldsValue({ mic: micList[0].text });
      console.log('vdList:', vdList);
      console.log('micList:', micList);
      setVdSource(vdList);
      setMedias(vdList);
    };

    // 初始化设备
    GGRtcClient.GetInitLocalDevices(getDeviceListCB).then(() => {
      // 设置默认设备id（当前下拉框所选的设备作为默认）
      g_currentVideoID.current = formRef.getFieldValue('vd');
      g_currentAudioID.current = formRef.getFieldValue('mic');
      console.log('g_currentVideoID = ');
      console.log(g_currentVideoID.current);
      console.log('g_currentAudioID = ');
      console.log(g_currentAudioID.current);

      update_g_constraints(); // 更新g_constraints对象参数
    });
  };

  const getPermissionsAndEnumDevices = () => {
    // 先询问权限，再列举设备列表 -- 靠谱
    GGRtcClient.getPermissions().then(() => {
      listEnumerateDevices();
    });

    // 绑定设备变更事件操作函数
    GGRtcClient.bindOnDeviceChange(listEnumerateDevices);
  };

  const listPixel = () => {
    const pixelList: any = [];
    // 从GGRtcClient全局定义的分辨率参数获取
    GGRtcClient.g_pixel_mode.forEach((item: any, index: any) => {
      pixelList.push({
        value: item.pixel.width + 'x' + item.pixel.height,
        text: item.desc + '(' + item.type + ')',
      });
      // if (item.default) {
      //   $('#cameraPixel').get(0).selectedIndex = index; // 默认选中（注意不能触发change事件）
      // }
    });
    formRef.setFieldsValue({ pixel: pixelList[0].text });
  };

  const INIT = async () => {
    // step1  检测浏览器是否支持RTC
    const support: any = GGRtcClient.CheckSupportWebRTC();
    console.log(support);
    if (!support) {
      message.warning('WebRTC功能请在定制浏览器中运行！');
      return;
    }
    // step2  提示获取摄像头等设备权限后，再列举设备
    await getPermissionsAndEnumDevices();
    // step3 初始化其他
    listPixel(); // 列举和选定默认分辨率
  };

  // 挂断视频
  const HANGUP = () => {
    message.destroy();
    if (!g_isCalling.current) {
      message.error('当前未建立远程协助会话');
      return;
    }

    // 发出挂断信令
    rtcClient.current.hangup(() => {
      message.info('挂断成功');
      console.log('会话状态标志 => false');
      g_isCalling.current = false;
    });
  };

  // 初始化设备参数
  const doBindChangeEvent = async (type: any, val: any) => {
    console.log(type, val);

    options.current.roomId = g_roomId.current;
    // options.current.userId = g_userName.current;
    if (options.current.roomId && !rtcClient.current)
      rtcClient.current = new GGRtcClient(options.current);
    else message.warning('未指定远程协助会话的roomId参数');

    switch (type) {
      case 'vd':
        // formRef.setFieldsValue({vd:val.label});
        // async function (evt:any) {
        console.log('切换摄像头设备id = ' + val.value);
        g_currentVideoID.current = val.value;
        update_g_constraints(); // 刷新g_constraints参数

        // 每次切换，静音/视按钮复位
        // setmAudio(false);
        // setmVideo(false);

        // 如果在通话中，则切换视频
        if (g_isCalling.current) await rtcClient.current.doChangeCamera();
        // }
        break;
      case 'mic':
        // formRef.setFieldsValue({mic:val.label});
        console.log('当前麦克风设备id = ' + val.value);
        g_currentAudioID.current = val.value;
        update_g_constraints(); // 刷新g_constraints参数
        break;
      case 'pixel':
        // 分辨率选择事件
        // formRef.setFieldsValue({pixel:val.label})
        g_currentPixel.current = val.value;
        console.log('当前分辨率 g_currentPixel = ' + g_currentPixel.current);
        update_g_constraints(); // 更新g_constraints

        // 如果在通话中，则切换视频
        if (g_isCalling.current) await rtcClient.current.doChangeCamera();
        // selectedIndex属性设置不会触发change事件
        // 所以此处先触发一次change事件，方便更新g_constraints参数
        // $('#cameraPixel').trigger("change");
        break;
      case 'frame':
        // 帧率改变事件
        // 如果正在视频当中，则不重新做媒体协商
        // formRef.setFieldsValue({frame:val.label})
        g_currentFrameRate.current = parseInt(val.value);
        if (g_currentFrameRate > 24) g_currentFrameRate.current = 60;
        if (g_currentFrameRate <= 0) g_currentFrameRate.current = 15;
        console.log('当前帧率 g_currentFrameRate = ' + g_currentFrameRate.current);

        update_g_constraints(); // 更新g_constraints
        break;
      case 'bitRate':
        // 码率切换（需要在视频交互过程中切换）
        // formRef.setFieldsValue({bitRate:val.label})
        console.log('当前码率 = ' + val.value + ' kbps');
        update_g_constraints();
        val.disabled = true; // 每次设置时，在没成功设置前，先把本下拉框设为无效，防止用户频繁设置
        if (g_isCalling.current) rtcClient.current.doChangeBandwidth(val.value); // 设置
        val.disabled = false; // 设置成功后，再次启用本下拉框
        break;
      default:
        break;
    }
  };

  const autoInit = () => {
    JOIN_ROOM();
  };

  // 视频初始化
  const startInit = () => {
    // const randomUser: any = Math.floor(Math.random() * (100 - 1)) + 1;
    // g_userName.current = `user_${randomUser}`;
    // setCallerUserName(g_userName.current);
    INIT();

    // if (window.IPCR) {
    //   window.IPCR.on('DESKTOP', async (event: any, data: any) => {
    //     if (data.cmd === 'screens') {
    //       console.log(data.list);
    //     }
    //   });
    // }

    formRef.setFieldsValue({ frame: frame[0] });
    formRef.setFieldsValue({ bitRate: bitRate[0] });

    autoInit();
  };

  useEffect(() => {
    g_roomId.current = getConfigFromBroswer(['term_id']).term_id;
    g_userName.current = getConfigFromBroswer(['term_id']).term_id;
    console.log('房间号:', getConfigFromBroswer(['term_id']).term_id);

    return () => {
      // 目前无法做阻塞式弹出
      // 在通话中需要弹出确认是否离开；是：断流，否：保持
      if (g_isCalling.current) {
        HANGUP();
        updateSocket(prev => ({ ...prev, status: ServerStatus.在线, roomStatus: RoomStatus.idle }));
      }
    };
  }, [updateSocket]);

  useEffect(() => {
    return () => {
      console.log('执行退出了');
      if (g_isCalling.current) {
        console.log('正在通话中，断流并重置房间状态');
        HANGUP();
        updateSocket(prev => ({ ...prev, status: ServerStatus.在线, roomStatus: RoomStatus.idle }));
      }
    };
  }, []);

  // 菜单栏按钮功能
  const buttonFuc = () => {
    if (isVTM) {
      HANGUP();
      // LEAVE_ROOM();
    } else {
      startInit();
    }
    setVTM(!isVTM);

    // HANGUP();
  };

  useTimeout(() => {
    console.log('创建坐席房间～～～');
    buttonFuc();
  }, 1000);

  /**
   * @todo
   * 谨防组件卸载后再调用而导致内存泄露
   */
  window.startVTM = buttonFuc;

  /**
   * 变更房间状态
   * 主要对 挂断当前业务 做了额外处理
   */
  const { loading: roomLoading, run } = useRequest(changeRoomStatus, {
    manual: true,
    onSuccess: (bool, params) => {
      if (bool) {
        const [s] = params;
        /** 主动挂断后需要做的系列操作 */
        if (s === RoomStatus.idle) {
          // alert('do run');
          updateSocket(prev => ({ ...prev, currentOrder: {}, status: ServerStatus.在线 }));
          // resetPoster();
          // LEAVE_ROOM();
          HANGUP();
        }
        console.log('修改之后的房间状态', state.roomStatus);
      }
    },
  });

  /**
   * 用于在“暂停服务”与“恢复服务”之间切换
   */
  const roomBtnHandler = () => {
    console.log('当前房间状态：', state.roomStatus);
    let t = RoomStatus.busy;
    if (state.roomStatus === RoomStatus.busy) {
      t = RoomStatus.pause;
    }
    // updateSocket(prev => ({ ...prev, roomStatus: t }));
    run(t);
  };

  const rshareClickHandle = async (e: MouseEvent<HTMLVideoElement>) => {
    console.log(':: rshareClickHandle ::');
    const { width, height } = e.currentTarget.getBoundingClientRect();
    // 注意对方屏幕分辨率（实际撑满屏幕的dom大小）
    const targetScreenWidth = 1920,
      targetScreenHeight = 1080;
    const scaleW = toFixed(targetScreenWidth / width);
    const scaleH = toFixed(targetScreenHeight / height);
    const ret = await HttpReqPost('/dispatch/sendMsg', {
      media_seq_no: state.currentOrder.media_seq_no,
      type: 'operate',
      direct: '0',
      data: {
        x: toFixed(e.nativeEvent.offsetX * scaleW),
        y: toFixed(e.nativeEvent.offsetY * scaleH),
      },
    });
    console.log(ret);
  };

  // 座席端向web发送消息
  const sendMsg = async (con, msg) => {
    const ret = await HttpReqPost('/dispatch/sendMsg', {
      media_seq_no: state.currentOrder.media_seq_no,
      type: 'msg',
      direct: '0',
      data: { msg: msg, connect: con },
    });
    console.log(ret);
  };

  return (
    <PageContainer
      extra={[
        <Select
          labelInValue
          onChange={value => doBindChangeEvent('vd', value)}
          value={vdSource && vdSource.length > 0 ? vdSource[0].text : ''}
          key="select-cm"
        >
          {vdSource
            ? vdSource.map((item: any, index: any) => {
                // console.log(vdSource)
                return (
                  <Option value={item.value} key={index}>
                    {item.text}
                  </Option>
                );
              })
            : ''}
        </Select>,
        // <Button
        //   key="demo-start-btn"
        //   type="primary"
        //   icon={<PlayCircleOutlined />}
        //   onClick={buttonFuc}
        // >
        //   {/* <Button key="pause-btn" type="dashed" danger icon={<PauseCircleOutlined />}> */}
        //   开始远程对话 - 测试
        // </Button>,
        <Button
          disabled={state.roomStatus === RoomStatus.idle}
          key="pause-btn"
          type="dashed"
          icon={
            state.roomStatus === RoomStatus.pause ? <PlayCircleOutlined /> : <PauseCircleOutlined />
          }
          onClick={roomBtnHandler}
          loading={roomLoading}
        >
          {state.roomStatus === RoomStatus.pause ? '恢复服务' : '暂停服务'}
        </Button>,
        <Button
          disabled={state.roomStatus === RoomStatus.idle}
          key="finish-btn"
          danger
          icon={<StopOutlined />}
          onClick={() => {
            // rtcClient.current.stopLocalRecord();
            REC_LOCAL_VD(false);
            REC_REMOTE_VD(false); // 结束录制远端视频
            REC_REMOTESHARE_VD(false);
            setOpe(true); //结束服务时将远程协助按钮置为初始状态
            run(RoomStatus.idle);

            /** 结束当前业务，重入菜单，清空当前业务的所有留存数据 */
            history.push('/swm/vtm');
          }}
          loading={roomLoading}
        >
          结束服务
        </Button>,
        <Button
          disabled={!g_isCalling.current}
          onClick={() => {
            setOpe(!operateState);
            if (operateState) {
              sendMsg(1, '远程正在操控您的屏幕...');
            } else {
              sendMsg(0, '远程操控结束');
            }
          }}
          key="noty-btn2"
        >
          {!operateState ? '结束操作' : '操作远程屏幕'}
        </Button>,
        // <Button key="noty-btn3" onClick={()=>{g_isCalling.current=false}}>重置</Button>
        // <Button
        //   onClick={() => {
        //     rtcClient.current.sendChatMessage(
        //       {
        //         //消息类型
        //         type:'mouse_click',
        //         //数据体
        //         data:{
        //         x:0,
        //         y:0
        //         }
        //       }
        //       ,(result:any)=>{
        //       console.log('message结果：' + JSON.stringify(result));
        //     })
        //   }}
        //   key="noty-btn"
        // >
        //   测试
        // </Button>,
      ]}
      className="vtm-container"
      breadcrumb={null}
      title="业务办理"
      subTitle={state.currentOrder?.trd_name}
    >
      <div
        className={clsx('grid grid-rows-1 gap-4 transition-all', {
          // 与另外一个属性取反，内嵌业务菜单时置为 true
          'grid-cols-12': BUSINESS_MENU_REQUIRED,
          'grid-cols-3': !BUSINESS_MENU_REQUIRED,
        })}
      >
        <section
          className={clsx('grid grid-rows-2 grid-cols-1 gap-4', {
            'col-span-2': BUSINESS_MENU_REQUIRED,
            'col-span-1': !BUSINESS_MENU_REQUIRED,
          })}
        >
          <div className={styles.card}>
            <Row className={styles.title}>
              <div className={styles.title_content}>座席端视频</div>
            </Row>
            <Row className={styles.card_content}>
              <video id="rtcA" src="" muted poster={'./assets/poster.jpg'} className={styles.vd} />
            </Row>
          </div>
          <div className={styles.card}>
            <Row className={styles.title}>
              <div className={styles.title_content}>SWM端视频</div>
            </Row>
            <Row className={styles.card_content}>
              <video id="rtcB" src="" poster={'./assets/poster.jpg'} className={styles.vd} />
            </Row>
          </div>
        </section>
        <section
          className={clsx(styles.card2, styles.main, {
            'col-span-7': BUSINESS_MENU_REQUIRED,
            'col-span-2': !BUSINESS_MENU_REQUIRED,
          })}
        >
          {/* 远端share视频流 */}
          <Row className={styles.title} style={{ height: '40px' }}>
            <div className={styles.title_content} style={{ fontSize: '20px' }}>
              SWM端桌面视频
            </div>
          </Row>
          <Row className={styles.card_content}>
            <video
              id="rshare"
              autoPlay
              playsInline
              muted
              poster={'./assets/poster2.jpg'}
              // webkit-playsinline="true"
              className={styles.vd2}
              onClick={e => {
                if (!operateState && g_isCalling.current) rshareClickHandle(e);
              }}
            />
          </Row>
        </section>
        {/* 业务菜单选择 ---- start */}
        {BUSINESS_MENU_REQUIRED && (
          <section
            className={clsx(styles.serviceWrapper, {
              [styles.expanded]: open,
            })}
          >
            {location.pathname !== '/swm/vtm/menus' && (
              <Tooltip title={open ? '收起' : '展开'}>
                <Button
                  shape="circle"
                  className={clsx(styles.collapseBtn, {
                    'rotate-90': !open,
                    '-rotate-90': open,
                    [styles.expanded]: open,
                  })}
                  onClick={toggle}
                >
                  <VerticalAlignBottomOutlined />
                </Button>
              </Tooltip>
            )}
            {Children.map(props.children as ReactElement, child =>
              cloneElement(child, { expand: open, collapse, setOpen }),
            )}
          </section>
        )}
        {/* 业务菜单选择 ---- end */}
      </div>
      <footer className={styles.footerContainer}>
        <Descriptions column={4}>
          <Descriptions.Item label="远程连接状态">
            <Field
              mode="read"
              text="open"
              valueEnum={{
                open: {
                  status: g_isCalling.current ? 'Success' : 'Error',
                  text: g_isCalling.current ? '已连接' : '未连接',
                },
              }}
            />
          </Descriptions.Item>
          <Descriptions.Item label="本地视频状态">
            <Field
              mode="read"
              text="normal"
              valueEnum={{
                normal: { status: 'Success', text: '正常' },
              }}
            />
          </Descriptions.Item>
          <Descriptions.Item span={2} label="传输率">
            <Statistic
              title="上行"
              value={sendRate}
              precision={2}
              valueStyle={{ color: '#3f8600', fontSize: '0.75rem' }}
              prefix={<ArrowUpOutlined />}
              suffix="kb/s"
              className={clsx(styles.mr4, styles.statistic)}
            />
            <Statistic
              title="下行"
              value={resvRate}
              precision={2}
              valueStyle={{ color: '#cf1322', fontSize: '0.75rem' }}
              prefix={<ArrowDownOutlined />}
              suffix="kb/s"
              className={styles.statistic}
            />
          </Descriptions.Item>
        </Descriptions>
      </footer>
    </PageContainer>
  );
}

export default VTM;
