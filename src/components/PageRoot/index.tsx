import { KeepAlive } from '@/components';
import { PageContainer } from '@ant-design/pro-components';
import { HttpReqPost, HttpReqGet, Ajax } from '@/core/trade';
// import { Spin } from 'antd';
import styles from './index.less';
import { useEffect } from 'react';
import { useLocation } from 'umi';

/**
 * 页面根节点自动创建
 * @param props 
 *        ……keepalive:是否要开启页面的keepalive功能（默认开启状态）
 *        ……className:自定义根节点样式（默认使用根节点自带的样式）
 *        ……loading:是否开启页面的loading状态（默认关闭）
 * @returns 
 */
const DomRoot = (props: any) => {
    //外部不配置keepalive属性时，默认开启keepalive，即：needKeepAlive默认值是true
    // const needKeepAlive: boolean = (props.keepalive && props.keepalive === false) ? false : true;
    const location: any = useLocation();

    useEffect(() => {
        return () => {

        }
    }, []);

    //需要keepalive的根节点DOM返回内容
    return <PageContainer
        // 不需要头部区域
        header={{ title: null, style: { display: 'none' } }}
        loading={props.loading}
        className={props.className ? props.className : styles.root}
    >
        {props.children}
    </PageContainer>

}

export { DomRoot, HttpReqPost, HttpReqGet, Ajax, KeepAlive };