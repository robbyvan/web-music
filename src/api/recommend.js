import axios from 'axios';
import jsonp from 'common/js/jsonp';
import { commonParams, options } from './config.js';

// 获得推荐slider内容
export function getRecommend() {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg';
  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1,
  });
  return jsonp(url, data, options);
}

// 获得歌单列表
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

// 获得歌单的歌曲列表
export function getSongList(disstid) {
  const url = '/api/getCdInfo';

  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0
  });

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data);
  });
}
