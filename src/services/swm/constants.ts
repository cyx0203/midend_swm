enum SWM_API {
  代办查询 = '/dispatch/queryNeeddeal',
  抢单 = '/dispatch/snatchOrder',
  房间登记 = '/dispatch/registerRoom',
  签退 = '/dispatch/signOut',
  房间恢复 = '/dispatch/resume',
  房间挂起 = '/dispatch/suspend',
  房间空闲 = '/dispatch/endTrcd',
  院区映射查询 = '/dispatch/queryHosp',
}

export enum TradeStatus {
  suc = '0',
}

export enum RoomStatus {
  pause,
  busy,
  idle,
}

export default SWM_API;
