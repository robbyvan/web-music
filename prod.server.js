const axios = require('axios');
const bodyParser = require('body-parser');
const express = require('express');
const config = require('./config/index');

const https = require('https');
const privateKey = fs.readFileSync('/etc/nginx/cert/2_robbyvan.cn.key', 'utf-8');
const certificate = fs.readFileSync('/etc/nginx/cert/1_robbyvan.cn_bundle.crt', 'utf-8');
const credentials = { key: privateKey, cert: certificate };

const app = express();
const apiRoutes = express.Router();

apiRoutes.use(bodyParser.urlencoded({ extended: true }));

// 获取推荐歌单
apiRoutes.get('/getRecommendList', (req, res) => {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg';
  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  })
    .then(response => res.json(response.data))
    .catch(e => console.log(e));
});

// 获取歌单歌曲
apiRoutes.get('/getCdInfo', function (req, res) {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg';
  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query,
  }).then((response) => {
    let ret = response.data;
    if (typeof ret === 'string') {
      const reg = /^\w+\(({.+})\)$/;
      const matches = ret.match(reg);
      if (matches) {
        ret = JSON.parse(matches[1]);
      }
    }
    res.json(ret)
  }).catch((e) => {
    console.log(e)
  });
});

// 获取音乐地址
apiRoutes.post('/getPurlUrl', bodyParser.json(), function (req, res) {
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
  axios.post(url, req.body, {
    headers: {
      referer: 'https://y.qq.com/',
      origin: 'https://y.qq.com',
      'Content-type': 'application/x-www-form-urlencoded'
    }
  }).then((response) => {
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
});

// 获取歌词
apiRoutes.get('/lyric', function (req, res) {
  const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    let ret = response.data
    if (typeof ret === 'string') {
      const reg = /^\w+\(({.+})\)$/
      const matches = ret.match(reg)
      if (matches) {
        ret = JSON.parse(matches[1])
      }
    }
    res.json(ret)
  }).catch((e) => {
    console.log(e)
  })
});

// 搜索
apiRoutes.get('/search', function (req, res) {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp';
  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    res.json(response.data)
  }).catch((e) => {
    console.log(e);
  })
});

app.use(express.static('./dist'));

app.use('/api', apiRoutes);

const port = process.env.PORT || config.build.port;

const httpsServer = https.createServer(credentials, app);

module.exports = httpsServer.listen(port, function(err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('App running at http://localhost:' + port + '\n');
});

