import { useEffect, useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { getConfigFromBroswer } from '@/utils';
import Field from '@ant-design/pro-field';
import {
  Button,
  Descriptions,
  Statistic,
  PageHeader,
  Input,
  Space,
  Select,
  List,
  Form,
  Switch,
  Card,
  message,
  Badge,
  Row,
} from 'antd';
import CheckForm from './drawer';
import styles from './index.module.less';
import clsx from 'classnames';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import GGRtcClient from '@/core/GGRtcClient-1.3.0.js';
import { useRequest, useTimeout } from 'ahooks';
import { useModel } from 'umi';
import { RoomStatus } from '@/services/swm/constants';
import { ServerStatus } from '@/models/socket';
import { HttpReqPost } from '@/core/trade';

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

function VTM() {
  const { changeRoomStatus, state, setState: updateSocket } = useModel('socket');

  // 控制vtm视频开关
  const [isVTM, setVTM] = useState(false);
  const Option = Select.Option;

  // const [recBtnTxt, setRecBtnTxt] = useState<any>('录制本地视频');
  // const [recremoteBtnTxt, setRecRemoteBtnTxt] = useState<any>('录制远端视频');
  const oprateRemoteState = useRef(0);
  const [operateState, setOpe] = useState(true);

  //在线用户数据列表
  const [onlineUsers, setOnlineUsers] = useState<any>([]);
  //摄像头
  const [vdSource, setVdSource] = useState<Array<any>>([]);
  //像素
  const [pixel, setPixel] = useState<Array<any>>([]);
  //帧率
  const [frame, setFrame] = useState<Array<any>>(['15', '20', '25', '30', '60']);
  //码率
  const [bitRate, setBitRate] = useState<Array<any>>([
    'unlimited',
    '2000',
    '1000',
    '500',
    '250',
    '125',
  ]);

  //进度
  const [luploadProgress, setluploadP] = useState('');
  const [ruploadProgress, setruploadP] = useState('');

  //摄像头
  const [micSource, setMicSource] = useState<Array<any>>([]);

  const [calleeUserName, setCalleeUserName] = useState<any>('');
  const [callerUserName, setCallerUserName] = useState<any>('');
  const [resvRate, setResvRate] = useState<any>('N/A');
  const [sendRate, setSendRate] = useState<any>('N/A');
  const [shareList, setShareList] = useState<any>([]);
  const [isshare, setIsshare] = useState(false);

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
  const [muteAudio, setmAudio] = useState(false);
  const [muteVideo, setmVideo] = useState(false);

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
    // SignalServerAddr: "https://127.0.0.1:8443",

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

          if (confirm('终端: ' + data.caller + ' 向你发起远程协助, 是否同意?')) {
            console.log('同意');
            g_isCalling.current = true; // 保存到全局变量

            data.replyCode = 1; // 发送响应（状态码为1，表示同意）
            setTimeout(() => {
              REC_LOCAL_VD(true); // 录制本地视频
              REC_REMOTE_VD(true); // 录制远端视频
              REC_REMOTESHARE_VD(true);
            }, 3000);
          } else {
            console.log('拒绝');
            data.replyCode = 2; // 发送响应（状态码为2，表示拒绝）
          }
        } finally {
          console.log('准备发送reply响应');
          rtcClient.current.reply(data); // 主动发送回应(给呼叫端)
        }
      },

      // ================== （呼叫端）收到被呼叫端请求响应消息 ==================
      onReply: (data: any, isCalling: any) => {
        console.log('onReply', data); // {roomid: "room1", callee: "user_85", caller: "user_9", replyCode: 1}
        console.log('isCalling', isCalling); // 是否正在视频会话中，true-是，false-否
        g_isCalling.current = isCalling; // 保存到全局变量
      },

      // ================== 视频P2P握手连接完成 ==============================
      onP2PConnectCompleted: () => {
        console.log('视频P2P握手连接完成...');

        console.log('开启码率设置功能');
        // $('#bandwidth').attr("disabled", false);  // 在P2P对接成功后设置
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
      },

      // ================== 收到远端用户断线消息 ==================
      onRemoteDisconnect: (roomid: any, disconnect_user: any, userlist: any) => {
        console.log('收到远端用户断线消息...');

        console.log('会话状态标志 => false');
        g_isCalling.current = false;

        message.destroy();
        message.warn(`收到远程终端[ ${disconnect_user} ]断线消息...`);

        setOnlineUsers(userlist);

        updateSocket(prev => ({ ...prev, roomStatus: RoomStatus.idle, status: ServerStatus.在线 }));
      },

      // 码率数据事件（每隔一秒回调）
      onStreamRate: (sendRate: any, resvRate: any) => {
        setSendRate(sendRate);
        setResvRate(resvRate);
      },
    },
  });

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

      let vdList: any = [];
      let micList: any = [];
      // 分别将音频和视频设备添加到下拉框
      deviceArray.forEach((device: any) => {
        // console.log('cyxDevice:',device)
        let [kind, type, direction] = device.kind.match(/(\w+)(input|output)/i);
        if (type == 'audio' && direction == 'input') {
          micList.push({ value: device.deviceId, text: device.label });
        } else if (type == 'video' && direction == 'input') {
          vdList.push({ value: device.deviceId, text: device.label });
        }
      });
      formRef.setFieldsValue({ vd: vdList[0].text });
      formRef.setFieldsValue({ mic: micList[0].text });
      setVdSource(vdList);
      setMicSource(micList);
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
    setPixel(pixelList);
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

    // step4  初始化控件基础绑定事件
    // doBindControlEvent();

    // step5 初始化控件变更事件
    // doBindChangeEvent();

    // console.log(vdSource);
    // setTimeout(() => {
    //   console.log(vdSource);
    // }, 3000);
    // g_currentAudioID.current = vdSource[0].value;
  };

  const JOIN_ROOM = () => {
    message.destroy();
    options.current.roomId = g_roomId.current;
    options.current.userId = g_userName.current;
    // 初始化RTCClient对象
    if (!rtcClient.current) {
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
            console.log('进入房间标志');
            // 进入房间标志
            g_isJoinRoom.current = true;
            // message.info('成功进入房间');
            setOnlineUsers(result.accounts);
          } else {
            message.error(result.msg);
          }

          // 把房间的所有人显示到用户列表
          // for (let index in result.accounts) {
          //   $('#login-users').append($('<li>').text(result.accounts[index].account));
          // }

          // if (result.code == 0) {
          //   console.log("进入房间标志");
          //   g_isJoinRoom = true; // 进入房间标志
          // }
        });
      } catch (error) {
        console.warn((error as Error).message);
        message.warn(error.message);
      }
    }
  };

  const LEAVE_ROOM = () => {
    message.destroy();
    if (!g_isJoinRoom.current) {
      message.error('未加入远程协助会话房间');
      return; // 未加入房间，直接退出
    }
    console.log(`用户:${g_userName} 离开了房间[${g_roomId}]`);

    // 执行离开房间
    rtcClient.current.leave((result: any) => {
      console.log('离开房间的执行结果：' + JSON.stringify(result));

      // 如果服务端成功执行
      if (result.code == 0) {
        console.log('会话状态标志 => false');
        g_isCalling.current = false;
        console.log('退出房间标志 => false');
        g_isJoinRoom.current = false;
        console.log('清空GGRtcClient对象');
        rtcClient.current = null;
        message.info('成功退出远程协助会话');
        setOnlineUsers(result.accounts);
      } else {
        message.error(result.msg);
      }
    });
  };

  const CALL = () => {
    message.destroy();
    if (!g_isJoinRoom.current) {
      message.error('您未加入远程协助会话房间');
      return;
    }

    if (g_isCalling.current) {
      message.error('当前正在与终端' + rtcClient.current._remoteUser + '通话，请先挂断');
      return;
    }

    const caller = g_userName.current; // 当前用户
    const callee = g_calleeUserName.current; // 被呼叫用户

    console.log('🚀');
    console.log(caller);
    console.log(callee);

    if (!callee) {
      message.error('未选择被呼叫用户');
      return;
    }
    if (caller == callee) {
      message.error('不能跟自己进行视频会话');
      return;
    }

    console.log(caller + ' 呼叫 ' + callee);
    // 与信令服务交互
    rtcClient.current.call(callee, (result: any) => {
      // 打印回调信息
      console.log('视频呼叫的执行结果: ' + JSON.stringify(result)); // {"code":0,"msg":"send call msg to user_2199327"}
      // 提示错误信息
      if (result.code != 0) {
        message.error('呼叫失败: ' + result.msg);
      }
    });
  };

  const COPY_CALLEE = (account: string) => {
    console.log(`copy -->${account}`);
    g_calleeUserName.current = account;
    setCalleeUserName(account);
  };

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

  const REC_LOCAL_VD = flag => {
    console.error('REC_LOCAL_VD', flag);
    message.destroy();
    if (!g_isCalling.current) {
      message.error('请先建立视频会话');
      return;
    }
    if (flag === true) {
      rtcClient.current.startLocalRecord();
      // alert('开始录制本地');
      // recTag.current = true;
    } else {
      console.error('结束录制本地');
      rtcClient.current.stopLocalRecord();
      // alert('结束录制本地');
      // recTag.current = false;
    }
  };

  const PLAY_LOCAL_VD = () => {
    if (!rtcClient.current) return;
    rtcClient.current.playLocalRecord('rtcREC');
  };
  const DOWNLOAD_LOCAL_VD = () => {
    if (!rtcClient.current) return;
    rtcClient.current.saveLocalRecord(`${state.currentOrder.media_seq_no}_local`);
  };
  const UPLOAD_LOCAL_VD = () => {
    if (!rtcClient.current) return;

    const roomId = g_roomId.current; // 房间号
    const caller = g_userName.current; // 当前用户
    const callee = g_calleeUserName.current; // 被呼叫用户
    const flowno = '000001'; // 交易流水

    const fileName = 'record_' + flowno + '_' + roomId + '_' + caller;

    const resultCB = function (info: any) {
      // 结果回调
      console.log('上传结果：', info);
    };
    const percentCB = function (info: any) {
      // 上传进度回调（可省略）
      console.log('上传进度：', info);
      setluploadP(info);
    };

    rtcClient.current.uploadLocalRecord(fileName, resultCB, percentCB);
  };

  const REC_REMOTE_VD = flag => {
    message.destroy();
    if (!g_isCalling.current) {
      message.error('请先建立视频会话');
      return;
    }

    if (flag === true) {
      // $("#btn_recLocal")[0].innerHTML = "停止录制本地视频";
      rtcClient.current.startRemoteRecord();
      // recRemoteTag.current = true;
      // alert('开始录制远程');
    } else {
      // $("#btn_recLocal")[0].innerHTML = "录制本地视频";
      rtcClient.current.stopRemoteRecord();
      // recRemoteTag.current = false;
      // alert('结束录制远程');
    }
  };
  const PLAY_REMOTE_VD = () => {
    if (!rtcClient.current) return;
    rtcClient.current.playRemoteRecord('rtcRemoteREC');
  };
  const DOWNLOAD_REMOTE_VD = () => {
    if (!rtcClient.current) return;
    rtcClient.current.saveRemoteRecord(`${state.currentOrder.media_seq_no}_remote`);
  };
  const UPLOAD_REMOTE_VD = () => {
    if (!rtcClient.current) return;

    const roomId = g_roomId.current; // 房间号
    const caller = g_userName.current; // 当前用户
    const callee = g_calleeUserName.current; // 被呼叫用户
    const flowno = '000001'; // 交易流水

    const fileName = 'record_' + flowno + '_' + roomId + '_' + callee;

    const resultCB = function (info: any) {
      // 结果回调
      console.log('上传结果：', info);
    };
    const percentCB = function (info: any) {
      // 上传进度回调（可省略）
      console.log('上传进度：', info);
      setruploadP(info);
    };

    rtcClient.current.uploadRemoteRecord(fileName, resultCB, percentCB);
  };

  const REC_REMOTESHARE_VD = flag => {
    message.destroy();
    if (!g_isCalling.current) {
      message.error('请先建立视频会话');
      return;
    }

    if (flag === true) {
      // $("#btn_recLocal")[0].innerHTML = "停止录制本地视频";
      rtcClient.current.startRemoteShareRecord();
      // recRemoteShareTag.current = true;
      // alert('开始录制分享');
    } else {
      // $("#btn_recLocal")[0].innerHTML = "录制本地视频";
      rtcClient.current.stopRemoteShareRecord();
      // recRemoteShareTag.current = false;
      // alert('结束录制分享');
    }
  };
  const PLAY_REMOTESHARE_VD = () => {
    if (!rtcClient.current) return;
    rtcClient.current.playRemoteShareRecord('rtcRemoteShareREC');
  };
  const DOWNLOAD_REMOTESHARE_VD = () => {
    if (!rtcClient.current) return;
    rtcClient.current.saveRemoteShareRecord(`${state.currentOrder.media_seq_no}_remoteshare`);
  };

  const STOP_SHARE = async () => {
    if (!rtcClient.current) return;
    rtcClient.current.stopLocalShare();
    setIsshare(false);
  };

  const SHARE = async (id: any) => {
    if (!rtcClient.current) return;
    // rtcClient.current.doLocalShare();
    if (!window.IPCR) {
      message.destroy();
      message.error('未获取到IPCRender');
      return;
    }

    const video: any = document.querySelector('#share');
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        //@ts-ignore
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: id ? id : shareList[0].id,
          // 'screen:724848853:0',
          // minWidth: 1000,
          // maxWidth: 1000,
          // minHeight: 500,
          // maxHeight: 500
        },
      },
    });
    video.srcObject = stream;
    video.play();
    rtcClient.current.doLocalShare(stream);
  };

  const doBindChangeEvent = async (type: any, val: any) => {
    console.log(type, val);

    // options.current.roomId = g_roomId.current;
    // options.current.userId = g_userName.current;
    if (!rtcClient.current) rtcClient.current = new GGRtcClient(options.current);

    switch (type) {
      case 'vd':
        // formRef.setFieldsValue({vd:val.label});
        // async function (evt:any) {
        console.log('切换摄像头设备id = ' + val.value);
        g_currentVideoID.current = val.value;
        update_g_constraints(); // 刷新g_constraints参数

        // 每次切换，静音/视按钮复位
        setmAudio(false);
        setmVideo(false);

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
        var bw = val.value;
        if (g_isCalling.current) rtcClient.current.doChangeBandwidth(bw); // 设置
        val.disabled = false; // 设置成功后，再次启用本下拉框
        break;
      default:
        break;
    }
  };

  const autoInit = () => {
    // if (window.IPCR) {
    //   window.IPCR.on('vtm', async (event: any, data: any) => {
    //     // alert(data)
    //     console.log('vtm:', data);
    //     doBindChangeEvent('vd', { value: data.vd });
    //     doBindChangeEvent('pixel', { value: data.pixel });
    //     doBindChangeEvent('frame', { value: data.frame });
    //     doBindChangeEvent('biteRate', { value: data.bitRate });
    //     doBindChangeEvent('mic', { value: data.mic });
    //   });
    // }
    JOIN_ROOM();
  };

  const startInit = () => {
    // const randomUser: any = Math.floor(Math.random() * (100 - 1)) + 1;
    // g_userName.current = `user_${randomUser}`;
    setCallerUserName(g_userName.current);
    INIT();

    if (window.IPCR) {
      window.IPCR.on('DESKTOP', async (event: any, data: any) => {
        if (data.cmd === 'screens') {
          console.log(data.list);
          setShareList(data.list);
        }
      });
    }

    formRef.setFieldsValue({ frame: frame[0] });
    formRef.setFieldsValue({ bitRate: bitRate[0] });

    autoInit();
    // if (window.IPCR) {
    //   window.IPCR.send('ready', true);
    // }
  };

  useEffect(() => {
    // setTimeout(()=>{g_isCalling.current=true},1500)

    // const randomUser: any = Math.floor(Math.random() * (100 - 1)) + 1;
    // g_userName.current = `user_${randomUser}`;
    // setCallerUserName(g_userName.current);
    // INIT();

    // if (window.IPCR) {
    //   window.IPCR.on('DESKTOP', async (event: any, data: any) => {
    //     if (data.cmd === 'screens') {
    //       console.log(data.list);
    //       setShareList(data.list);
    //     }
    //   });
    if (window.IPCR) {
      window.IPCR.send('DESKTOP', { cmd: 'screens' });
    }
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

  const buttonFuc = () => {
    // if (window.IPCR){
    // window.IPCR.send('MQ_OPEN')
    // window.IPCR.on('MQ_MSG', (event, args) => {
    // alert(args)
    // console.log(args)
    // })
    // }

    if (isVTM) {
      HANGUP();
      LEAVE_ROOM();
    } else {
      startInit();
    }
    setVTM(!isVTM);
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
          REC_LOCAL_VD(false); // 结束录制本地视频
          REC_REMOTE_VD(false); // 结束录制远端视频
          REC_REMOTESHARE_VD(false);
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

  const rshareClickHandle = (e: any) => {
    console.log(':: rshareClickHandle ::');
    console.log(e.nativeEvent.offsetX);
    console.log(e.nativeEvent.offsetY);
  };

  const sendMsg = async () => {
    const ret = await HttpReqPost('/dispatch/sendMsg', {
      media_seq_no: state.currentOrder.media_seq_no,
      type: 'operate',
      direct: '0',
      data: { msg: '远程正在操控您的屏幕...' },
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
            run(RoomStatus.idle);
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
              sendMsg();
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
      subTitle={state.currentOrder?.trd_name}
    >
      <div className="grid grid-rows-1 grid-cols-6 gap-4 transition-all">
        <section className={clsx('grid grid-rows-2 grid-cols-1 col-span-1 gap-4')}>
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
        <section className={clsx('col-span-3', styles.card2, styles.main)}>
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
                rshareClickHandle(e);
              }}
            />
          </Row>
        </section>

        {/* <Space className={styles.block}>
          <Card title="本地REC视频流" bordered={false}>
            <video id="rtcREC" src="" controls className={styles.vd}></video>
          </Card>
          <Card title="远端REC视频流" bordered={false}>
            <video id="rtcRemoteREC" src="" controls className={styles.vd}></video>
          </Card>
          <Card title="远端分享视频流" bordered={false}>
            <video id="rtcRemoteShareREC" src="" controls className={styles.vd}></video>
          </Card>
        </Space> */}

        <section className="relative col-span-2">
          <CheckForm />
        </section>
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
