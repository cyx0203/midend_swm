import Constructing from '@/components/PageStatus/constructing';
import { useEffect } from 'react';

interface IProps {
  collapse: () => void;
}

export default function NotFound(props: IProps) {
  useEffect(() => {
    return () => props.collapse();
  }, []);
  return <Constructing />;
}
