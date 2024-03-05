import { useAliveController } from 'umi';
import type { CachingNode_Z } from './Tab';
import Tab from './Tab';

import styles from './index.module.less';

export default function HeaderTab() {
  const { getCachingNodes } = useAliveController();

  const inCache = getCachingNodes() as CachingNode_Z[];

  // console.log(inCache, '缓存中 inCache');

  return (
    <ul className={styles['tab-container']}>
      {inCache.map(v => (
        <Tab child={v} key={`caching-${v.id}`} persistant={v.persistant} />
      ))}
    </ul>
  );
}
