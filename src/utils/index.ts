import { add, eq, pick, pipe, prop } from 'lodash/fp';

const isSeat = pipe(prop('vtm_type'), eq('01'));

/**
 * 从定制浏览器中获取配置参数
 * @param props 需要获取的参数项
 * @param namespace 命名空间，默认为 VTM配置
 * @returns
 *
 * @example
 *
 * const config = getConfigFromBroswer(['term_id', 'demo_name']);
 * // 如果不存在某条配置，该条配置的返回值默认为空字符串！
 * // {
 * //    term_id: '',
 * //    demo_name: ''
 * // }
 */
export const getConfigFromBroswer: (
  props: string[],
  namespace?: string,
) => Record<string, string> = (props, namespace = 'VTM配置') => {
  if (window.z?.config) {
    // 额外做一次校验，非坐席（01）直接置空；
    const res = pick(props, window.z.config[namespace]);
    if (props.includes('term_id') && !isSeat(window.z.config.VTM配置)) {
      res.term_id = '';
    }
    return res;
  } else {
    return props.reduce((acc, cur) => ({ ...acc, [cur]: '' }), {});
  }
};

export const uuid: () => string = () =>
  (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
  );

export const inc = add(1);
export const dec = add(-1);

export const toFixed = (n: number, rest: number = 2) => +n.toFixed(rest);
