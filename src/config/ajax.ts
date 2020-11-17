import Taro from "@tarojs/taro";

const HOSTURL = "http://127.0.0.1:3000"
// const HOSTURL = "https://322b074517.eicp.vip"

let requestTimes = 0  // 请求次数
export const ajax = async (params) => {
  requestTimes++
  Taro.showLoading({title: '加载中', mask: true})
  return new Promise((resolve, reject) => {
    Taro.request({
      ...params,
      url: HOSTURL + params.url,
      success: (res)=>{
        resolve(res.data)
      },
      fail: (err) => {
        Taro.showToast({title: '网络连接失败', icon: 'none'})
        reject(err)
      },
      complete: () => {
        requestTimes--
        requestTimes == 0 && Taro.hideLoading()
      }
    })
  })
}