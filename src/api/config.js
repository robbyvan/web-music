export const commonParams = {
  // g_tk: 5381,
  g_tk: 1928093487,
  format: 'jsonp',
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0
};

export const options = {
  param: 'jsonpCallback'
};

export const ERR_OK = 0;

export function formatUrl(path) {
  const debug = process.env.NODE_ENV !== 'production';
  return debug ? path : `https://robbyvan.cn/music${path}`;
}
