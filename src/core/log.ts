import { isEmpty } from 'lodash';

type TYPE = 'APP' | 'PAGE' | 'TRADE' | 'OTHER';
type CONSOLETYPE = 'LOG' | 'WARN' | 'ERROR';

/**
 * 日志统一输出方法[该方法已覆盖掉原有的console]
 * @param content……日志内容
 * @param title……日志标题
 * @param type……日志内容所属类型
 * @param consoleType……日志输出类型
 * Warning：该方法中禁止使用'console.XXX',否则会出现死循环
 */
const LogBase: any = (
  content: any,
  title: string = '',
  type: TYPE = 'OTHER',
  consoleType: CONSOLETYPE = 'LOG',
) => {
  //获取时间戳
  const timeStamp: string = new Date(+new Date() + 8 * 3600 * 1000)
    ?.toJSON()
    ?.substr(0, 23)
    ?.replace('T', ' ');

  //获取日志标题内容
  const _title: string = !title || isEmpty(title) ? '' : `<${title}>`;

  //输出日志块Header
  isEmpty(_title)
    ? console.debug(
        `%c [${type}] %c <${timeStamp}> %c`,
        'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
        'background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
        'background:transparent',
      )
    : console.debug(
        `%c [${type}] %c ${_title} %c <${timeStamp}> %c `,
        'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
        'background:#004CFF ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
        'background:#41b883 ; padding: 1px; border-radius: 0;  color: #fff',
        'background:transparent',
      );

  //按日志类型，输出日志块主体内容
  if (consoleType === 'LOG') window.GGMIDENDPRO.console.log(content);
  if (consoleType === 'WARN') window.GGMIDENDPRO.console.warn(content);
  if (consoleType === 'ERROR') window.GGMIDENDPRO.console.error(content);

  //输出日志块Footer
  console.debug(
    `%c -END- %c`,
    'background:#795548 ; padding: 1px; border-radius: 3px;  color: #fff',
    'background:transparent',
  );
};

const Log: any = (content: any, title: string = '', type: TYPE = 'OTHER') => {
  LogBase(content, title, type, 'LOG');
};

const Warn: any = (content: any, title: string = '', type: TYPE = 'OTHER') => {
  LogBase(content, title, type, 'WARN');
};

const Error: any = (content: any, title: string = '', type: TYPE = 'OTHER') => {
  LogBase(content, title, type, 'ERROR');
};

const LogList = {
  log: Log,
  warn: Warn,
  error: Error,
};

export { LogBase, LogList };
