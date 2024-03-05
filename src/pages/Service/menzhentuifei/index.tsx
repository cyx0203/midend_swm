import { ProPageHeader } from '@ant-design/pro-components';
import Constructing from '@/components/PageStatus/constructing';
import { Button } from 'antd';
import { Link } from 'umi';
import clsx from 'classnames';
import styles from './index.module.less';
import { useEffect } from 'react';

interface IProps {
  expand: boolean;
  collapse: () => void;
}

export default function Menzhentuifei(props: IProps) {
  const { expand } = props;

  useEffect(() => {
    return () => props.collapse();
  }, []);

  return (
    <div className={clsx(styles.container, { [styles.expanded]: expand })}>
      <ProPageHeader prefixedClassName="" breadcrumb={null} />
      <Constructing
        extra={
          <Button type="primary">
            <Link to="/swm/vtm">返回菜单</Link>
          </Button>
        }
      />
    </div>
  );
}
