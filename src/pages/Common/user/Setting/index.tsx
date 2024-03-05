import { Button } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';

import { DomRoot, Ajax } from '@/components/PageRoot';

export default () => {
  useEffect(() => {
    return () => {

    }
  }, []);

  return (
    <DomRoot>
      <div className={styles.main}>SETTING</div>
    </DomRoot>
  );
};

