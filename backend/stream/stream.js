import { DWClient, EventAck, TOPIC_CARD } from 'dingtalk-stream-sdk-nodejs'
import config from '../datas/ding.config.json' with {type: 'json'}
import https from 'https'
import { getToken } from '../utils/getToken.js'
import axios from 'axios'
import { getConnect, getParams } from "../utils/spark.js"
let chatHistoryMay = {};//聊天历史 存储每个用户的聊天历史
let chatLenMap = {};//每一个用户的聊天回复字段长度


const convertJSONValuesToString = (obj) => {
    const newObj = {};
    for (const key in obj) {
        const value = obj[key];
        if (obj.hasOwnProperty(key) && value != null) {
            if (typeof value === "string") {
                newObj[key] = value;
            } else {
                newObj[key] = JSON.stringify(value);
            }
        }
    }
    return newObj;
};

export const initStream = () => {
    console.log("Stream初始化！")
    //初始化客户端 和钉钉建立stream长连接 
    //初始化成功后 钉钉会不断推送事件和消息到这个 client
    const client = new DWClient({
        clientId: config.AppKey,
        clientSecret: config.AppSecret
    })
    /**
 * @type {import("dingtalk-stream-sdk-nodejs").DWClientDownStream}
 */
    const onEventReceived = async (event) => {
        /*
        console.log(event)
        {
      specVersion: '1.0',
      type: 'EVENT',
      headers: {
        appId: 'd28a1467-f941-48ac-a8bb-4567cdc426a7',
        connectionId: '779e1c2f-8df0-11f0-8bc5-6647947ab531',
        contentType: 'application/json',
        eventBornTime: '1757472483707',
        eventCorpId: 'ding5c60e1d214cfde09ffe93478753d9884',
        eventId: 'd74d68cb12014eb49ee483570092229e',
        eventType: 'chat_update_title',
        eventUnifiedAppId: 'd28a1467-f941-48ac-a8bb-4567cdc426a7',
        messageId: '21081875_d2d_19830cc044c_d5b0cb8',
        time: '1757472483835',
        topic: '*'
      },
      data: '{"timeStamp":1757472483704,"eventId":"d74d68cb12014eb49ee483570092229e","chatId":"chatd983d305a8c5b21a5bf746e7e2141895","operatorUnionId":"gdiio6iPuU62QJERlUcHIoMAiEiE","title":"应用开发1","openConversationId":"cid2uGu2n7OBXfYfkybEKS2AA==","operator":"372664483629095423"}'
    }
        */
        const now = new Date();
        console.log(`received event, delay=${now.getTime() - parseInt(event.headers?.eventBornTime || '0')}ms`)
        //对于群名修改监听做出的动作
        if (event.headers?.eventType == 'chat_update_title') {
            // ignore events not equals `chat_update_title`; 忽略`chat_update_title`之外的其他事件；
            // 该示例仅演示 chat_update_title 类型的事件订阅；
            //  stream模式下，服务端推送消息到client后，会监听client响应，如果消息长时间未响应会在一定时间内(60s)重试推消息，可以通过此方法返回消息响应，避免多次接收服务端消息。
            // 机器人topic，可以通过socketCallBackResponse方法返回消息响应

            //http机器人进行回复 通过调用API回复
            let openConversationId = "cid2uGu2n7OBXfYfkybEKS2AA=="
            let robotCode = "dingwlz5egorsatk63wz"
            accessToken = await getToken()
            let res = axios({
                headers: {
                    'x-acs-dingtalk-access-token': accessToken,
                    'Content-Type': 'application/json'
                },
                url: "https://api.dingtalk.com/v1.0/robot/groupMessages/send",
                method: 'POST',
                data: {
                    "msgParam": JSON.stringify({ content: "钉钉，让进步发生" }),
                    "msgKey": "sampleText",
                    "openConversationId": openConversationId,
                    "robotCode": robotCode,
                }
            })


            client.send(event.headers.messageId, { status: EventAck.SUCCESS })
            return { status: EventAck.SUCCESS };
        }
        //防止反复触发
        return { status: EventAck.SUCCESS, message: 'OK' };
    }

    client.registerCallbackListener('/v1.0/im/bot/messages/get', async (res) => {
        // 注册机器人回调事件
        console.log("收到消息", res);
        const { messageId } = res.headers;
        const { text, senderStaffId, sessionWebhook, conversationId } = JSON.parse(res.data);
        //当机器人监听到指定信息（如send）时，机器人做出相应的动作
        if (text.content.trim() == 'send') {
            //监听到send时 机器人发送卡片到相应群聊中
            //data中所需的数据
            const cardTemplateId = "72be321a-9591-4c5d-b70d-d621643f9d2e.schema";
            const outTrackId = Math.random().toString(16).slice(2, 14);
            const callbackType = "STREAM";
            const openSpaceId = `dtv1.card//IM_GROUP.${conversationId};`
            let robotCode = "dingwlz5egorsatk63wz"
            let access_token = await getToken()
            const supportForward = true;
            const data = {
                cardTemplateId,
                outTrackId,
                callbackType,
                openSpaceId,
                imGroupOpenDeliverModel: {
                    robotCode,
                },
                imGroupOpenSpaceModel: {
                    supportForward,
                },
                cardData: {
                    "cardParamMap": {
                        "lastMessage": "审批",
                        "title": "枕套提交的财务报销",				   // 整数类型属性
                        "type": "费用报销",	                   // 浮点类型属性
                        "amount": "10000元",		           // 布尔类型属性，对应 TRUE
                        "reason": "出差",
                        "createTime": new Date().toDateString,
                        "status": "审批中"		   // 布尔类型属性，对应 FALSE
                    }
                },
                "privateData": {
                    "372664483629095423": {
                        "cardParamMap": {
                            "title": "dashu"
                        }
                    }
                },
            };
            try {
                let result = await axios({
                    method: 'POST',
                    headers: {
                        'x-acs-dingtalk-access-token': access_token,
                        'Content-Type': 'application/json',
                    },
                    url: "https://api.dingtalk.com/v1.0/card/instances/createAndDeliver",
                    data
                });
                if (result?.data) {
                    console.log(result.data.result, 'result.data')
                }
            } catch (error) {
                console.log(error.response.data, 'error.response.data')
            }

        } else {
            //机器人回复消息 通过webhook进行回复
            // const data = JSON.stringify({
            //     'msgtype': 'text',
            //     'text': {
            //         'content': '重复说你说的话' + text.content,
            //     },
            //     'at': {
            //         'atUserIds': [
            //             senderStaffId
            //         ],
            //     }
            // });
            // const options = {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     }
            // }
            // const req = https.request(sessionWebhook, options, (res) => {
            //     console.log(`状态码: ${res.statusCode}`)
            //     res.on('data', (d) => {
            //         console.log('data:', d)
            //     })
            // });
            // req.on('error', (error) => {
            //     console.error(error);
            // })
            // req.write(data);
            // req.end();

            //除了send之外的消息，则使用讯飞星火大模型进行回复
            const content = text.content.trim()
            const body = {
                at: {
                    // atUserIds: [senderStaffId],
                    isAtAll: false,
                },
                text: {
                    // content:
                    //   "（🥕）" + text?.content ||
                    //   "钉钉,让进步发生",
                },
                msgtype: "text",
            };
            const accessToken = await getToken();
            if (!chatHistoryMay[senderStaffId]) {
                chatHistoryMay[senderStaffId] = [];
            }
            if (!chatLenMap[senderStaffId]) {
                chatLenMap[senderStaffId] = 0;
            }
            chatHistoryMay[senderStaffId].push({ role: 'user', content });
            const data = getParams(chatHistoryMay[senderStaffId], senderStaffId);
            const connect = await getConnect();
            connect.send(JSON.stringify(data));
            let fullAnswer = "";
            //解析connect返回的message内容
            //message为星火大模型返回的内容
            connect.on('message', async (val) => {
                val = val.toString('utf-8');
                const data = JSON.parse(val);
                const payload = data.payload;
                const choices = payload.choices;
                const status = choices.status;
                const text = choices.text;
                if (status !== 2) {
                    fullAnswer += text[0].content;
                    if (fullAnswer.length > (200 + chatLenMap[senderStaffId])) {
                        body.text.content = fullAnswer.slice(chatLenMap[senderStaffId]);
                        chatLenMap[senderStaffId] = fullAnswer.length
                        //将解析得到的内容
                        //再通过钉钉机器人进行发送
                        axios({
                            url:sessionWebhook,
                            method:"POST",
                            responseType: "json",
                            data: body,
                            headers: {
                                "x-acs-dingtalk-access-token":accessToken,
                            },
                        });
                    }
                }else{
                    //星火大模型生成内容完成
                    fullAnswer += text[0].content;
                    body.text.content = fullAnswer.slice(chatLenMap[senderStaffId]);
                    chatHistoryMay[senderStaffId].push({
                        role: 'assistant',
                        content: fullAnswer,
                    });
                    const result = await axios({
                        url: sessionWebhook,
                        method: "POST",
                        responseType: 'json',
                        data: body,
                        headers: {
                            "x-acs-dingtalk-access-token":accessToken,
                        },
                    });
                    chatLenMap[senderStaffId] = 0;
                }
            });
            //对话超过30句 则将对话历史进行清空
            if(chatHistoryMay[senderStaffId].length > 30){
                chatHistoryMay[senderStaffId] = chatHistoryMay[senderStaffId].slice(-30);
            }

        }
        client.send(messageId, { status: EventAck.SUCCESS })
        return { status: EventAck.SUCCESS, message: 'OK' };

    })
    //用于注册监听任意事件 在函数中进行类型判断
    client.registerAllEventListener(onEventReceived)

    client.registerCallbackListener(TOPIC_CARD, async (event) => {
        const { messageId } = event.headers;
        // e5481d6d0c3b
        const message = JSON.parse(event.data);
        console.log("card callback message: ", message);
        const cardPrivateData = JSON.parse(message.content).cardPrivateData;
        const params = cardPrivateData.params;
        const action = params.action;
        const outTrackId = message.outTrackId;
        const accessToken = await getToken();
        const data = {
            outTrackId,
            cardData: {
                "cardParamMap": {
                    "lastMessage": "审批",
                    "title": "枕套提交的财务报销",				   // 整数类型属性
                    "type": "费用报销",	                   // 浮点类型属性
                    "amount": "10000元",		           // 布尔类型属性，对应 TRUE
                    "reason": "出差",
                    "createTime": new Date().toDateString,
                    "status": "审批中"		   // 布尔类型属性，对应 FALSE
                }
            },
            privateData: convertJSONValuesToString({
                "372664483629095423": {
                    "cardParamMap": {
                        title: "red润123456789"
                    }
                }

            }),
            cardUpdateOptions: convertJSONValuesToString({
                updateCardDataByKey: false,
                updatePrivateDataByKey: false
            }),
        };
        try {
            let result = await axios({
                headers: {
                    'Content-Type': 'application/json',
                    "x-acs-dingtalk-access-token": accessToken
                },
                method: 'put',//!!!!!!!!!!
                url: `https://api.dingtalk.com/v1.0/card/instances`,
                data
            });
            if (result?.data) {
                console.log(result.data.result, 'result.data')
            }
        } catch (error) {
            console.log(error.response.data, 'error.response.data')
        }
        client.send(messageId, EventAck.SUCCESS);
    })
        //注册监听事件后 进行和钉钉长连接
        .connect();
}