import dingService from '../service/dingService.js'
import ConstCode from '../utils/ConstCode.js'
import { signToken } from '../utils/auth.js'

//控制层代码
/**
 * 
 * @param {import('express').Request} req 请求头对象
 * @param {import('express').Response} res 响应头对象
 */
const dingController = {
    async jsSdkAuthorized(req,res){
        let ticket = req[ConstCode.DING_ACCESS_TICKET]
        //在服务层做计算签名
        let url = req.query.url;
        let signatureObj = dingService.sign(ticket,url)
        res.send({
            code: 200,
            signatureObj
        })
    },

    // 获取用户信息
    async getUserInfo(req, res) {
        let { code } = req.body;
        let token = req[ConstCode.DING_ACCESS_TOKEN];
        try {
            let dingUserInfo = await dingService.getDingUserInfo(token, code);
            console.log(dingUserInfo);
            res.send({
                code: 200,
                data: {
                    dingUserInfo,
                    // 自己的token签名 要与钉钉的AccessToken区分开
                    // 后端也要给前端签发一个token 本地的话直接模拟一个token
                    auth_token: signToken()
                }
            })
        } catch (error) {
            console.log(error);
            res.status(400).send(error);
        }
  },
}

export default dingController;