import { request } from 'umi';

export const getOrders = params => {
  return request('/api/queryNeeddeal', {
    method: 'POST',
    data: params,
  });
};
