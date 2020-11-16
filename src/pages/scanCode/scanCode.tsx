import { View, Text } from '@tarojs/components';
import * as React from 'react';
import './scanCode.scss'
import Taro from "@tarojs/taro";
import { AtFab, AtIcon } from 'taro-ui'
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
        console.log(res)
      }
    })
  }
  render() { 
    return (
      <View className="scanCode_page">
        <View className="">
          <View className="scan_btn">
            <AtIcon prefixClass='icon-saoma' value="add" color="#1989FA" />
          </View>
          <Text>加入会议</Text>
        </View>
        <AtFab onClick={this.onScanCode}>
          <AtIcon prefixClass='icon-saoma' value="add" color="#1989FA" />
        </AtFab>
      </View>
    );
  }
}
 
export default ScanCode;