import axios from 'axios';
import jsonp from 'common/js/jsonp';
import { commonParams, options } from './config.js';

export function getRecommend() {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg';
  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1,
  });
  return jsonp(url, data, options);
}

export function getList() {
  const url = '/api/getRecommendList';
  const data = Object.assign({}, commonParams, {
    rnd: Math.random(),
    hostUin: 0,
    format: 'json',
    platform: 'yqq',
    needNewCode: 0,
    categoryId: 10000000,
    sortId: 5,
    sin: 0,
    ein: 29
  });
  // const data = {};
  return axios.get(url, {
    params: data
  })
    .then(res => Promise.resolve(res.data))
    .catch(e => console.log(e));
}
