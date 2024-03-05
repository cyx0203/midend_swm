import { Button, message, notification } from 'antd';
import { useIntl, history } from 'umi';
import defaultSettings from '../config/defaultSettings';
import { LogList } from '@/core/log';
import { Store } from 'storage-timing';

const { pwa } = defaultSettings;
const isHttps = document.location.protocol === 'https:';

notification.open({
  message: MAIN_TITLE,
  description: (
    <div>
      <p>{`${VERSION}`}</p>
      <p>{`${process.env.NODE_ENV}`}</p>
    </div>
  ),
  duration: 2,
  onClose: async () => null,
});
/**
 * 框架启动时初始化处理区域
 */
const AppInit = () => {
  window.addEventListener('unhandledrejection', event => {
    console.warn(`UNHANDLED PROMISE REJECTION: ${event.reason}`);
    // history.push({
    //   pathname: '/exception',
    //   query: {
    //     errMsg: event.reason
    //   }
    // });
  });

  // window.onunhandledrejection = event => {
  //   console.warn(`UNHANDLED PROMISE REJECTION: ${event.reason}`);
  //   event.preventDefault();
  //   history.push({
  //     pathname: '/exception'
  //   });
  // };

  window.onerror = (msg, url, l) => {
    let content: string = 'There was an error on this page.\n\n';
    content += 'Error: ' + msg + '\n';
    content += 'URL: ' + url + '\n';
    content += 'Line: ' + l + '\n\n';
    content += 'Click OK to continue.\n\n';
    // history.push({
    //   pathname:'/exception',
    //   query:{
    //     errMsg: content
    //   }
    // });
    return true;
  }; //如果返回值为 false，则在控制台 (JavaScript console) 中显示错误消息。反之则不会

  window.GGMIDENDPRO = {};
  if (LOG_OPTIMIZE) {
    window.GGMIDENDPRO = { console: null };
    window.GGMIDENDPRO.console = Object.assign({}, window.console);
    window.console.log = LogList.log;
    window.console.error = LogList.error;
    window.console.warn = LogList.warn;
  }

  if (LOG_FORBIDDEN) {
    window.console.log = () => {};
    window.console.error = () => {};
    window.console.debug = () => {};
    window.console.info = () => {};
    window.console.warn = () => {};
  }

  window.GGMIDENDPRO.GLoadingState = false;
  // window.GGMIDENDPRO.GlobalData = {};

  console.log('App Init');

  const ST = new Store();
  const STAtom = ST.atom('GGMIDENDPRO');
  window.GGMIDENDPRO.GlobalData = STAtom;
  console.log('初始化：STAtom');
};

AppInit();

const clearCache = () => {
  // remove all caches
  if (window.caches) {
    caches
      .keys()
      .then(keys => {
        keys.forEach(key => {
          caches.delete(key);
        });
      })
      .catch(e => console.log(e));
  }
};

// if pwa is true
if (pwa) {
  // Notify user if offline now
  window.addEventListener('sw.offline', () => {
    message.warning(useIntl().formatMessage({ id: 'app.pwa.offline' }));
  });

  // Pop up a prompt on the page asking the user if they want to use the latest version
  window.addEventListener('sw.updated', (event: Event) => {
    const e = event as CustomEvent;
    const reloadSW = async () => {
      // Check if there is sw whose state is waiting in ServiceWorkerRegistration
      // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
      const worker = e.detail && e.detail.waiting;
      if (!worker) {
        return true;
      }
      // Send skip-waiting event to waiting SW with MessageChannel
      await new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = msgEvent => {
          if (msgEvent.data.error) {
            reject(msgEvent.data.error);
          } else {
            resolve(msgEvent.data);
          }
        };
        worker.postMessage({ type: 'skip-waiting' }, [channel.port2]);
      });

      clearCache();
      window.location.reload();
      return true;
    };
    const key = `open${Date.now()}`;
    const btn = (
      <Button
        type="primary"
        onClick={() => {
          notification.close(key);
          reloadSW();
        }}
      >
        {useIntl().formatMessage({ id: 'app.pwa.serviceworker.updated.ok' })}
      </Button>
    );
    notification.open({
      message: useIntl().formatMessage({ id: 'app.pwa.serviceworker.updated' }),
      description: useIntl().formatMessage({ id: 'app.pwa.serviceworker.updated.hint' }),
      btn,
      key,
      onClose: async () => null,
    });
  });
} else if ('serviceWorker' in navigator && isHttps) {
  // unregister service worker
  const { serviceWorker } = navigator;
  if (serviceWorker.getRegistrations) {
    serviceWorker.getRegistrations().then(sws => {
      sws.forEach(sw => {
        sw.unregister();
      });
    });
  }
  serviceWorker.getRegistration().then(sw => {
    if (sw) sw.unregister();
  });

  clearCache();
}
