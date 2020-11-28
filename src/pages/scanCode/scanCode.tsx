import { View, Text, Image } from '@tarojs/components';
import * as React from 'react';
import './scanCode.scss'
import Taro from "@tarojs/taro";
import { AtFab, AtIcon, AtMessage } from 'taro-ui'
export interface ScanCodeProps {
  
}
 
export interface ScanCodeState {
  
}
 
class ScanCode extends React.Component<ScanCodeProps, ScanCodeState> {
  constructor(props: ScanCodeProps) {
    super(props);
    this.state = {};
  }
  onScanCode = () => {
    Taro.scanCode({
      success: res => {
        if(res.result == 'meeting'){
          Taro.atMessage({message: '扫码成功，即将进入会议', type: 'success'})
          setTimeout(() => {Taro.redirectTo({url: '/pages/index/index'})}, 3000);
        }else{
          Taro.atMessage({message: '扫码失败，请重试', type: 'error'})
        }
      }
    })
  }
  render() { 
    return (
      <View className="scanCode_page">
        <AtMessage />
        <View className="bg_img">
          <Image src='https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1606556041758&di=504d2cb055f3e20afd7b3d31aa581783&imgtype=0&src=http%3A%2F%2Finews.gtimg.com%2Fnewsapp_bt%2F0%2F12694368942%2F1000' />
        </View>
        <View className="title">
          <Text>扫描二维码进入会议</Text>
        </View>
        <View className="scan_btn">
          <AtFab onClick={this.onScanCode}>
            <AtIcon prefixClass='icon-saoma' value="add" />
          </AtFab>
        </View>
      </View>
    );
  }
}
 
export default ScanCode;