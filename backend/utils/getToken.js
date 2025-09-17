
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

import config from '../datas/ding.config.json' with {type:"json"}
import { getAccessToken } from '../api/index.js'

const appKey = config.AppKey
const appSecret = config.AppSecret

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const getToken = async()=>{
    let currentTime = Date.now();
    let accessTokenJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname,"../datas/token.json")));
    //向钉钉请求获取token
    if(accessTokenJSON.accessToken==''||accessTokenJSON.expireIn<currentTime){
        //token中的accessToken过期了 需要重新获取accessToken
        console.log("AccessToken过期了 需要重新获取accessToken！");
        let data = await getAccessToken(appKey,appSecret)
        accessTokenJSON.accessToken = data.accessToken
        //对于AccessToken的有效期提前5分钟到期
        //乘以1000的原因：Date.now()返回的是时间戳的形式，其单位为毫秒，data.expireIn单位为秒，所以需要乘以1000
        accessTokenJSON.expireIn = Date.now() + (data.expireIn - 300)*1000
        fs.writeFileSync(path.resolve(__dirname,"../datas/token.json"),JSON.stringify(accessTokenJSON));
        return accessTokenJSON.accessToken
    }else{
        //本地获取token
        console.log("没有过期，从本地直接获取AccessToken");
        return accessTokenJSON.accessToken
    }
}