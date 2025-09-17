//向钉钉发送请求的API
import request from "../utils/request.js";

const prefix1 = "https://api.dingtalk.com"
const prefix2 = "https://oapi.dingtalk.com"

/**
 * 获取accessToken的方法
 * @param {String} appKey 
 * @param {String} appSecret
 */
export const getAccessToken = async(appKey,appSecret)=>{
    return request({
        method: 'post',
        url: `${prefix1}/v1.0/oauth2/accessToken`,
        data: {
            "appKey":appKey,
            "appSecret":appSecret
        }
    })
}

/**
 * 获取jsapiTicket的方法
 * @param {String} token
 * @returns
 */
export const getjsapiTicket = async(token)=>{
    return request({
        method: 'post',
        url: `${prefix1}/v1.0/oauth2/jsapiTickets`,
        headers:{
            'x-acs-dingtalk-access-token':token,
            'Content-Type':'application/json'
        },
        data: {}
    })
}

/**
 * 企业内部access_token
 * @param {*} access_token
 * 企业内部面免登授权码
 * @param {*} code
 * @returns
 */
export const getDingUserInfo = async (access_token, code) => {
  return request({
    method: 'post',
    url: `${prefix2}/topapi/v2/user/getuserinfo`,
    params: {
      access_token
    },
    data: {
      code,
    }
  });
}