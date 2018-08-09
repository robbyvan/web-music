import originJSONP from 'jsonp';

export default function jsonp(url, data, option) {
  url += (url.indexOf('?') === -1 ? '?' : '&') + createQuery(data);

  return new Promise((resolve, reject) => {
    originJSONP(url, option, (err, data) => {
      if (!err) {
        resolve(data);
      } else {
        reject(err);
      }
    });
  });
}

function createQuery(data) {
  let url = '';
  for (let key in data) {
    let value = data[key] !== undefined ? data[key] : '';
    url += `&${key}=${encodeURIComponent(value)}`;
  }
  return url ? url.substring(1) : '';
}
