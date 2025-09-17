import request from '@/utils/request.js'
const prefix = "http://100.92.177.57:3000/dingding"


/**
 * 获取钉钉用户信息
 * @param {String} code 授权code
 * @returns 
 */
export const fetchDingUserInfo = async (code) => {
  return request({
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'post',
    url: `${prefix}/getUserInfo`,
    data: { code }
  });
}

export const jsSdkAuthorized = async(url) =>{
    return request({
        headers: {
            'Content-Type': 'application/json'
         },
        method: 'get',
        url: `${prefix}/jsSdkAuthorized`,
        params: {
            url
        }
    })
}