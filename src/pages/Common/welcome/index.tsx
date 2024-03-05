// import { Button } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import clsx from 'classnames';

//该库提供了页面层内容和通讯交易的两种方式
import { DomRoot, Ajax, KeepAlive } from '@/components/PageRoot';

//页面整体内容，需定义一个变量名
const Index = () => {
  // Hooks:useEffect
  useEffect(() => {
    // Init Todo...
    console.log('WELCOME');
    return () => {
      // Destroy Todo...
    };
  }, []);

  //页面渲染
  return (
    // 建议使用 <DomRoot> 标签来包裹一层，便于后续统一样式优化或功能增加
    <DomRoot>
      <div className={clsx(styles.main, 'text-center')}>11123451!1233</div>
    </DomRoot>
  );
};

// [此处是固定写法]
// 1、使用<KeepAlive>标签包裹上述定义的模版内容
// 2、persistant属性说明
// -> persistant=true:该页面KeepAlive状态下不可被关闭(一般用于welcome这种页面)
// -> persistant=false:该页面KeepAlive状态下可被关闭
export default () => (
  <KeepAlive persistant={true}>
    <Index />
  </KeepAlive>
);
