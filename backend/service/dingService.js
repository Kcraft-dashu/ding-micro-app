import config from "../datas/ding.config.json" with {type:'json'}
import { getRandomStr } from "../utils/sign.js";
import { sign } from "../utils/sign.js";
import { getDingUserInfo } from "../api/index.js";

const dingService = {
    sign(ticket,url){
        //自定义固定字符串
        let nonceStr = getRandomStr(16);
        //应用的标识
        let agentId = config.AgentId;
        //时间戳
        let timeStamp = Date.now();
        //企业ID
        let corpId = config.CorpId;
        let signature = sign(ticket,nonceStr,timeStamp,url)
        return{
            agentId,
            corpId,
            timeStamp,
            nonceStr,
            signature
        }
    },

    async getDingUserInfo(token, code) {
        let userInfo = await getDingUserInfo(token, code);
        return userInfo;
    },
}

export default dingService;