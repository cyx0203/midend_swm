import { Result } from 'antd';
import type { ResultProps } from 'antd';
import classNames from 'classnames';
import styles from './constructing.module.less';

interface IProps extends ResultProps {
  className?: string;
  imgClassName?: string;
}

/**
 * 页面开发中
 * @param props
 * @returns
 */
export default function Constructing(props: IProps) {
  const { imgClassName = '', ...others } = props;

  return (
    <Result
      title="正在建设中"
      icon={
        <img
          className={classNames(styles.img, imgClassName)}
          alt=""
          src="./icons/constructing.svg"
          draggable={false}
        />
      }
      {...others}
    />
  );
}
