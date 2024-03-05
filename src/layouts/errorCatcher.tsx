import { Button, Result, Typography } from 'antd';
import { Component } from 'react';
import type { ErrorInfo } from 'react';

export default class CustomBoundary extends Component<
  Record<string, any>,
  { hasError: boolean; errorInfo: Error }
> {
  state = { hasError: false, errorInfo: new Error() };

  static getDerivedStateFromError(error: Error) {
    if (error.message === 'ResizeObserver loop limit exceeded') {
      return { hasError: false };
    }
    return { hasError: true, errorInfo: error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          icon={<img width={256} draggable={false} src="./icons/catch.png" />}
          style={{
            height: '100%',
            background: '#fff',
          }}
          title="错误处理"
          extra={
            <>
              <div
                style={{
                  maxWidth: 620,
                  textAlign: 'start',
                  backgroundColor: 'rgba(255,229,100,0.3)',
                  borderInlineStartColor: '#ffe564',
                  borderInlineStartWidth: '9px',
                  borderInlineStartStyle: 'solid',
                  padding: '20px 45px 20px 26px',
                  margin: 'auto',
                  marginBlockEnd: '30px',
                  marginBlockStart: '20px',
                }}
              >
                <h1>{this.state.errorInfo.name}</h1>
                <Typography.Text type="secondary">{this.state.errorInfo.message}</Typography.Text>
                <Typography.Text type="secondary">{this.state.errorInfo.stack}</Typography.Text>
              </div>
              <Button
                type="primary"
                onClick={() => {
                  window.location.reload();
                }}
              >
                返回主页
              </Button>
            </>
          }
        />
      );
    }
    return this.props.children;
  }
}
