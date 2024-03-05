import Footer from '@/components/Footer';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { message, Tabs } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { history, useModel } from 'umi';
import styles from './index.less';
import { HttpReqPost } from '@/core/trade';
import defaultSettings from '../../../../../config/defaultSettings';
import MD5 from 'blueimp-md5';
//用户信息模拟数据
import MENU from '../../../../../mocks/login';
import SWM_API, { TradeStatus } from '@/services/swm/constants';
import { pick, prop } from 'lodash/fp';
import { getConfigFromBroswer } from '@/utils';

const LOGO: string = './assets/logo/logo.png';

const Login: React.FC = () => {
  //登录方式（目前此处仅用用户名&密码来登录）
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');

  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    return () => {};
  }, []);

  //跳过
  const skipLogin = () => {};

  /**
   * 登录提交操作
   * @param values [object]……输入内容
   */
  const submitHandle = async values => {
    //发起登录交易
    let ret: any = null;

    //实际登录交易执行的流程
    if (!SIKP_LOGIN) {
      ret = await HttpReqPost('/dispatch/signIn', {
        job_id: values.username,
        //前端MD5加密
        job_pwd: MD5(values.password),
        // password: values.password
        hospital_id: values.hospital_id,
      });

      console.log('!!!');
      console.log(ret);
      console.log(ret.header);
    }
    //模拟登录（跳过登录验证）执行的流程
    else {
      ret = MENU;
    }

    if (ret && ret.header && ret.header.returnCode === '0') {
      //获取该用户的账户名
      const account: string = ret.body.name;
      const userinfor: SWM.CurrentUser = ret.body;

      //将用户信息存储在localStorage中
      if (values.autoLogin) {
        //存储登录时用户名
        localStorage.setItem(`GGMIDENDPRO_LOGIN_NAME`, values.username);
        //存储登录时密码(明文)
        localStorage.setItem(`GGMIDENDPRO_LOGIN_PWD`, values.password);
        //存储登录后当前用户信息全量(JSON字符串形式)
        // localStorage.setItem(`${MAIN_TITLE}_CURRENT_USER`, JSON.stringify(userInfor));
        //存储登录时用户下次是否自动填登录信息
        localStorage.setItem(`GGMIDENDPRO_LOGIN_AUTO`, 'Y');
      }

      GGMIDENDPRO.GlobalData.set(userinfor, Date.now() + ST_TIMEOUT * 1000);

      await setInitialState({
        currentUser: userinfor,
        settings: defaultSettings,
      });

      const res = await HttpReqPost(SWM_API.房间登记, {
        ...pick(['hospital_id', 'job_id', 'level'])(userinfor),
        room_id: prop('term_id', getConfigFromBroswer(['term_id'])),
      });

      if (res.header.returnCode === TradeStatus.suc) {
        message.destroy();
        message.success(`${account} 登录成功`);

        //跳转到内页的默认页 welcome
        history.push({
          // pathname: LOGIN_SUCCESSOR_PAGE//'/welcome'
          pathname: '/',
        });
      } else {
        if (window.z) {
          // message.error('请确认终端类型已配置正确');
        }
        // 只有在非定制浏览器与开发环境下，才能登录测试
        if (process.env.NODE_ENV === 'development' && !window.z) {
          history.push({
            pathname: '/',
          });
        }
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoginForm
          logo={<img alt="logo" src={LOGO} />}
          title={`${MAIN_TITLE}`}
          subTitle={`${VERSION}`}
          formRef={formRef}
          initialValues={{
            autoLogin: localStorage.getItem(`GGMIDENDPRO_LOGIN_AUTO`) === 'N' ? false : true,
            username: localStorage.getItem(`GGMIDENDPRO_LOGIN_NAME`)
              ? localStorage.getItem(`GGMIDENDPRO_LOGIN_NAME`)
              : '',
            password: localStorage.getItem(`GGMIDENDPRO_LOGIN_PWD`)
              ? localStorage.getItem(`GGMIDENDPRO_LOGIN_PWD`)
              : '',
            hospital_id: HOS_MAP[0].fyid,
          }}
          onFinish={values => {
            return submitHandle(values);
          }}
        >
          <Tabs activeKey={type} onChange={setType}>
            <Tabs.TabPane key="account" tab={'坐席登录'} />
          </Tabs>

          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'用户名'}
                rules={[
                  {
                    required: true,
                    message: '请输入用户名!',
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'密码'}
                rules={[
                  {
                    required: true,
                    message: '请输入密码!',
                  },
                ]}
              />
              <ProFormSelect
                name="hospital_id"
                placeholder="请选择所在院区"
                // options={HOS_MAP.map(v => ({ label: v.name, value: v.fyid }))}
                request={async () => {
                  const res = await HttpReqPost(SWM_API.院区映射查询, {});
                  if (res.header.returnCode === TradeStatus.suc) {
                    const hosList = res.body.hosp_info as SWM.HospitalMap[];
                    const [defaultSelected] = hosList;

                    formRef.current?.setFieldValue('hospital_id', defaultSelected?.id);

                    return hosList.map(v => ({
                      label: v.name,
                      value: v.id,
                    }));
                  }

                  return [];
                }}
              />
            </>
          )}
          <div style={{ marginBottom: 24 }}>
            <ProFormCheckbox noStyle name="autoLogin">
              {`自动登录`}
            </ProFormCheckbox>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
