<script setup>
import * as dingTalk from "dingtalk-jsapi"
const corpId = import.meta.env.VITE_APP_CORPID
console.log(corpId)

const handleClosePage = () =>{
  dingTalk.closePage({
  success: () => {},
  fail: () => {},
  complete: () => {},
});
}

const handleSetNavigationIcon = () =>{
  try {
    dingTalk.setNavigationIcon({
      showIcon: true,
      iconIndex: 101,
      success: () => {},
      fail: () => {},
      complete: () => {},
    })
  } catch (error) {
    alert("不支持");
  }
}

const handleChooseImage = () =>{
  try {
    dingTalk.chooseImage({
    count: 9,
    secret: false,
    position: 'back',
    sourceType: ['camera', 'album'],
    success: (res) => {
      const { files, filePaths } = res;
    },
    fail: () => {},
    complete: () => {},
});
  } catch (error) {
    alert("不支持");
  }
}

const handleShare = () =>{
  try {
    dingTalk.share({
    url: 'https://www.dingtalk.com',
    type: 0,
    image:'https://img.alicdn.com/imgextra/i1/O1CN01SNHEw41ysQFPN5Ql6_!!6000000006634-55-tps-176-31.svg',
    title: '钉钉官网',
    content: '钉钉官网',
    success: () => {},
    fail: () => {},
    complete: () => {},
});
  } catch (error) {
    alert("不支持");
  }
}

const handleChooseChat = () =>{
  try {
    dingTalk.chooseChat({
    corpId: corpId,
    isAllowCreateGroup: true,
    filterNotOwnerGroup: true,
    success: (res) => {
      const { title, chatId, openConversationId } = res;
      console.log(title)
    },
    fail: () => {},
    complete: () => {},
    })
  } catch (error) {
    alert("不支持");
  }
}

</script>

<template>
  <main>
    <van-button type="primary" @click="handleClosePage">handleClosePage</van-button>
    <van-button type="success" @click="handleSetNavigationIcon">handleSetNavigationIcon（windows不支持）</van-button>
    <van-button type="default" @click="handleChooseImage">handleChooseImage（windows不支持）</van-button>
    <van-button type="danger" @click="handleChooseChat">handleChooseChat</van-button>
    <van-button type="warning" @click="handleShare">handleShare</van-button>
  </main>
</template>
