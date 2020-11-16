import React, { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { AtMessage, AtButton } from 'taro-ui'

import "taro-ui/dist/style/components/button.scss" // 按需引入
import './index.scss'
import { ajax } from '../../config/ajax'
import { PATH } from '../../config/path'
import Taro from "@tarojs/taro";

export interface IndexProps {
  
}
 
export interface IndexState {
  identity: number  // 身份 1 - 管理员  2 - 观众
}

type UserType = {
  code: number
  success: boolean
  identity: number
}
export default class Index extends Component<IndexProps, IndexState> {
  constructor(props: IndexProps){
    super(props)
    this.state = {
      identity: 1
    }
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleAdmin = () => {
    this.setState({
      identity: 1
    })
  }

  handleAudience = () => {
    this.setState({
      identity: 2
    })
  }
  // 获取用户信息
  getUserInfo = (e) => {
    const userInfo = e.target.userInfo
    this.login(userInfo)
  }

  // 登录
  async login(userInfo){
    const { identity } = this.state
    const res = await ajax({
      url: PATH.login,
      method: 'POST',
      data: {
        nickName: userInfo.nickName,
        identity: identity,
        gender: userInfo.gender,
        avatarUrl: userInfo.avatarUrl
      }
    })
    const result = res as UserType
    const user = {
      nickName: userInfo.nickName,
      identity: result.identity,
      gender: userInfo.gender,
      avatarUrl: userInfo.avatarUrl
    }
    if(result.code == 1) {
      Taro.setStorageSync('userInfo',user)
      Taro.atMessage({'message': '登陆成功', 'type': 'success'})
      setTimeout(() => {
        Taro.redirectTo({url: `/pages/home/home?identity=${identity}`})
      }, 1500);
    }
  }

  render () {
    const { identity } = this.state
    const adminImg = {icon: '../../assets/img/identity-1.svg', selectIcon: '../../assets/img/identity-1-select.svg'}
    const audienceImg = {icon: '../../assets/img/identity-2.svg', selectIcon: '../../assets/img/identity-2-select.svg'}
    return (
      <View className='index'>
        <AtMessage />
        <View className="meeting_manager">会议管理系统</View>
        <View className="title">请选择身份参加此会议</View>
        <View className="choose_identity">
          <View className="admin" onClick={this.handleAdmin}>
            <Image mode="aspectFit" src={identity==1?adminImg.selectIcon:adminImg.icon} />
            <Text style={{color: `${identity==1?'#1296DB':'#000'}`}}>管理员</Text>
          </View>
          <View className="audience" onClick={this.handleAudience}>
            <Image mode="aspectFit" src={identity==2?audienceImg.selectIcon:audienceImg.icon} />
            <Text style={{color: `${identity==2?'#1296DB':'#000'}`}}>观众</Text>
          </View>
        </View>
        <View className="login_view">
          <View className="login_nav">
            <View className="login_text">您选择的身份：<Text className="identity">{identity==1?'管理员':'观众'}</Text></View>
            <View className="login_btn">
              <AtButton type="secondary" openType="getUserInfo" onGetUserInfo={this.getUserInfo}>进入会议</AtButton>
            </View>
          </View>
          
        </View>
      </View>
    )
  }
}
export interface IndexProps {
  
}
 
export interface IndexState {
  
}