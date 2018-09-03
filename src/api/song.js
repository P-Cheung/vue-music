import {commonParams} from './config'
import jsonp from 'common/js/jsonp'
import axios from 'axios'

export function getLyric (mid) {
  let url = '/api/getLyric'

  let data = Object.assign({}, commonParams, {
    pcachetime: +new Date(),
    songmid: mid,
    loginUin: 0,
    hostUin: 0,
    platform: 'yqq',
    needNewCode: 0,
    format: 'json'
  })
  return axios.get(url, {
    params: data
  }).then(res => {
    return Promise.resolve(res.data)
  })
}

export function getSongVkey (songmid) { // 获取歌曲的vkey
  const url = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg'
  const data = Object.assign({}, commonParams, {
    g_tk: 145804121,
    callback: 'musicJsonCallback',
    loginUin: 0,
    format: 'json',
    platform: 'yqq',
    needNewCode: 0,
    cid: 205361747,
    uin: 0,
    guid: 142762417,
    songmid: songmid,
    filename: `C400${songmid}.m4a`
  })

  return jsonp(url, data)
}
