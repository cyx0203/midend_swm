import { ProPageHeader, RouteContext } from '@ant-design/pro-components';
import type { RouteContextType } from '@ant-design/pro-components';
import { useContext } from 'react';
import { history } from 'umi';
import styles from './index.module.less';
import { Typography } from 'antd';

export default function Menus() {
  const handleNavigate = (to: string) => {
    history.push(to);
  };

  const context = useContext<RouteContextType & { route?: { children: any[] } }>(RouteContext);

  const menus =
    context?.route.children.find(v => v.serviceIndex).children.filter(v => v.showInContainer) || [];

  return (
    <>
      <ProPageHeader
        header={{
          children: (
            <Typography.Text type="secondary">
              您可以从<b>待办业务</b>中选择业务，该板块将自动连接至对应业务中。
            </Typography.Text>
          ),
        }}
        prefixedClassName=""
        breadcrumb={null}
      />
      <ul className={styles.container}>
        {menus.map(v => (
          <li className={styles.menuItem} key={v.path} onClick={() => handleNavigate(v.path)}>
            {v.name}
          </li>
        ))}
      </ul>
    </>
  );
}
