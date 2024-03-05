declare namespace MOP {
  /** 响应 */
  interface Response<T = any> {
    returnresult: {
      /** 1 为正常，其余直接返回 errormsg */
      returncode: string;
      errormsg: string;
    };
    data: {
      data_row?: T[];
    };
  }

  type HosMap = {
    /** 分院id */
    fyid: string;
    /** 分部id */
    fbid: string;
    /** 院区名称 */
    name: string;
  };

  /** 住院信息 */
  type UserRecord = {
    birthday: string;
    hosbalance: string;
    address: string;
    patientsex: string;
    patid: string;
    zyh: string;
    departcode: string;
    advancefee: string;
    /** 住院流水号 */
    zylsh: string;
    sectiontype: string;
    deptname: string;
    hosdate: string;
    patientname: string;
    doctor: string;
    /** 身份证号 */
    sfzh: string;
    patientnation: string;
    phone: string;
    totalfee: string;
    bedno: string;
    patientage: string;
    hospitalname: string;
    /** 患者性质：自费、医保 */
    brxz: string;
    /** 就诊卡号 */
    jzkh: string;
    /**
     * 在院状态，分别对应：
     * 1.待入科;
     * 2.在科已分床;
     * 3.医生开出院（暂无）;
     * 4.护士执行出院;
     * 5.出院结算;
     * 6.转科中;
     * 7.取消住院（暂无）;
     * A:注销
     */
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'A';
  };

  /** 住院记录明细 */
  type PayDetail = {
    zyh: string;
    /** 预交金总额 */
    advancefee: string;
    cybq: string;
    /** 住院流水号 */
    zylsh: string;
    patientname: string;
    cyks: string;
    ryrq: string;
    /** 费用总额 */
    totalfee: string;
    bedno: string;
    yqmc: string;
    /**
     * 需要支付的金额 = 费用总额 - 预交款
     * 小于 0 则退病人余款
     */
    needpay: number;
    brxz: string;
    jzkh: string;
  };

  /** 发票汇总 */
  type Fees = {
    sflxid: string;
    sflxmc: string;
    je: string;
  };

  /** 预交记录 */
  type ChargeRecord = {
    patientname: string;
    powertranid: string;
    patientid: string;
    paytypelist: string;
    rcptno: string;
    trandate: string;
    tranmode: string;
    powerpaychannel: string;
    tranamount: string;
    /** 退款金额 */
    refound?: number;
  };

  /** 在院清单主信息 */
  type FeeMaster = {
    fplbtotalje: string;
    hosbalance: string;
    shouldpay: string;
    zyts: string;
    zylsh: string;
    patientname: string;
    departname: string;
    ryrq: string;
    totalamount: string;
    selfpay: string;
    cwh: string;
    paytotalamount: string;
    location: string;
    brxz: string;
    fplbzfje: string;
    fplbmc: string;
  };

  /** 在院清单明细 */
  type FeeDetail = {
    unit: string;
    xmmc: string;
    xmdj: string;
    xmsl: string;
    xmid: string;
    xmje: string;
    jzrq: string;
    zxks: string;
  };
}
