declare namespace SWM {
  interface Response<T = any> {
    header: {
      returnCode: string;
      returnMsg: string;
    };
    body: Record<string, any> & T;
  }

  type CurrentUser = {
    /** 座席人员工号 */
    job_id: string;
    /** 座席人员姓名 */
    name: string;
    /** 座席人员业务权限 */
    level: string;
    /** 医院编号 */
    hospital_id: string;
  };

  type Order = {
    swm_id: string;
    trd_type: string;
    level: string;
    media_seq_no: string;
    trd_name: string;
  };

  type HospitalMap = {
    name: string;
    id: string;
  };
}
