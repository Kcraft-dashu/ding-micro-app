
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

import { getjsapiTicket } from '../api/index.js'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 
 * @param {string} token 钉钉AccessToken
 * @returns 
 */

export const getTicket = async(token)=>{
    let currentTime = Date.now();
    let accessTicket = JSON.parse(fs.readFileSync(path.resolve(__dirname,"../datas/ticket.json")));
    //向钉钉请求获取Ticket
    if(accessTicket.jsapiTicket==''||accessTicket.expireIn<currentTime){
        //ticket中的Ticket过期了 需要重新获取accessTicket
        console.log("Ticket过期了 需要重新获取accessTicket！");
        let data = await getjsapiTicket(token)
        accessTicket.jsapiTicket= data.jsapiTicket
        //对于AccessToken的有效期提前5分钟到期
        //乘以1000的原因：Date.now()返回的是时间戳的形式，其单位为毫秒，data.expireIn单位为秒，所以需要乘以1000
        accessTicket.expireIn = Date.now() + (data.expireIn - 300)*1000
        fs.writeFileSync(path.resolve(__dirname,"../datas/ticket.json"),JSON.stringify(accessTicket));
        return accessTicket.accessToken
    }else{
        //本地获取token
        console.log("没有过期，从本地直接获取jsapiTicket");
        return accessTicket.jsapiTicket
    }
}