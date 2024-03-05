import Constructing from '@/components/PageStatus/constructing';
import { Button } from 'antd';
import { useEffect } from 'react';
import { Link } from 'umi';

interface IProps {
  collapse: () => void;
}

export default function Unknown(props: IProps) {
  useEffect(() => {
    return () => props.collapse();
  }, []);

  return (
    <Constructing
      title="正在开发中"
      extra={
        <Button type="primary">
          <Link to="/swm/vtm">返回菜单</Link>
        </Button>
      }
    />
  );
}
