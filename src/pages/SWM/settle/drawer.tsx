import styles from './form.module.less';
import clsx from 'classnames';
import { PageHeader } from 'antd';
import Constructing from '@/components/PageStatus/constructing';
import { useState } from 'react';

export default function () {
  /** 左上角展开按钮 */
  const [expand, setExpand] = useState(false);

  return (
    <aside className={clsx(styles.container, { [styles.expanded]: expand })}>
      <PageHeader
        title="门诊退费"
        className={clsx(styles.header, 'font-medium text-xl relative', {
          [styles.expanded]: expand,
        })}
        onBack={() => setExpand(!expand)}
      />
      <Constructing />
    </aside>
  );
}
