import { Text, View, Swiper, SwiperItem, MovableArea, MovableView } from '@tarojs/components';
import * as React from 'react';
import './home.scss'
import { AtAvatar, AtIcon, AtActionSheet, AtActionSheetItem, AtFab, AtModal, AtMessage } from 'taro-ui'
import Taro from "@tarojs/taro";
import { ajax } from '../../config/ajax'
import { PATH } from '../../config/path'
import { getCurrentInstance } from '@tarojs/taro'

type ResultType<T> = {
  code: number, 
  data: T
}
type UserType = {
  nickName: string
  identity: number
  gender: number
  avatarUrl: string
}
type AudienceType = {
  id: number
  nickName: string
  gender: number
  identity: number
  avatarUrl: string
}[][]
export interface HomeProps {
  
}
 
export interface HomeState {
  userInfo: UserType | unknown
  screenHeight: number
  audience: AudienceType | unknown
  isSelectShow: boolean
  isModalOpen: boolean
  pageY: number
}
 
class Home extends React.Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {
      userInfo: '',
      screenHeight: 0,
      audience: '',
      isSelectShow: false,
      isModalOpen: false,
      pageY: 0,
    };
  }
  componentDidMount() {
    const userInfo = Taro.getStorageSync('userInfo') || '';
    if(!userInfo) return Taro.atMessage({'message': '请返回重新登录', 'type': 'error'});
    this.setState({userInfo: userInfo as UserType});
    this.setState({screenHeight: Taro.getSystemInfoSync().screenHeight * 2});
    this.getInMeetingUser(userInfo)
  }
  // 获取观众
  getInMeetingUser = async (userInfo) => {
    const res = await ajax({
      url: PATH.getInMeetingUser,
      data: { nickName: userInfo.nickName }
    })
    const result = res as ResultType<AudienceType>
    result.code == 1 && this.setState({audience: result.data})
  }
  // 路由跳转
  toVotePage = () => {  // 表决   2个选项
    const identity = getCurrentInstance().router.params.identity
    Taro.navigateTo({
      url: `/pages/vote/vote?identity=${identity}`,
      success: () => {this.setState({isSelectShow: false})}
    })
  }
  toElectPage = () => {   // 选举   多选项
    const identity = getCurrentInstance().router.params.identity
    Taro.navigateTo({
      url: `/pages/elect/elect?identity=${identity}`,
      success: () => {this.setState({isSelectShow: false})}
    })
  }
  // 退出
  quit = () => {
    Taro.clearStorageSync()
    Taro.atMessage({'message': '退出成功', 'type': 'success'})
    setTimeout(() => {
      Taro.redirectTo({url: '/pages/index/index'})
    }, 1500);
  }
  render() { 
    const { userInfo, screenHeight, audience, isSelectShow, isModalOpen, pageY } = this.state
    const { nickName, avatarUrl, gender } = userInfo as UserType
    const identity = parseInt(getCurrentInstance().router.params.identity)
    const users = audience as AudienceType || []
    const screenWidth = Taro.getSystemInfoSync().screenWidth
    return (
      <View className="home_page">
        <AtMessage />
        <MovableArea style={{width: '100%', height: '100%'}}>
          {/* 用户信息 */}
          <View className="user_info">
            <View className='user_img'><AtAvatar image={avatarUrl} size="large"></AtAvatar></View>
            <View className="user_msg">
              <View className='user_name'>{nickName}</View>
              <View className='user_gender'>性别：{gender == 1 ? '男' : '女'}</View>
            </View>
            <View className="icon" onClick={() => this.setState({isSelectShow: true})}>
              <AtIcon prefixClass={identity == 1 ? "icon-zhuchiren" : "icon-zhuchiren1"} value="clock" />
            </View>
          </View>
          {/* 观众 */}
          <View className="swiper_nav">
            {
              users == [] ? 
              <View style={{textAlign: 'center', color: '#ccc',padding: '50rpx 0'}}>暂无观众</View> :
              <Swiper
                className='swiper_view'
                indicatorColor='#999'
                indicatorActiveColor='#333'
                indicatorDots={users.length > 1 ? true : false}
                style={{height: screenHeight-220+'rpx'}}
              >
                {
                  users.map(item => (
                    <SwiperItem>
                      <View className="audience_nav">
                        {
                          item.map(v => 
                          <View className='audience_card'>
                            <View className="audience_img"><AtAvatar image={v.avatarUrl} circle size="large" /></View>
                            <View className="audience_nickName">{v.nickName}</View>
                          </View>
                          )
                        }
                      </View>
                    </SwiperItem>
                  ))
                }
              </Swiper>
            }
          </View>
          {/* 选择框 */}
          <View className="choose_nav">
            <AtActionSheet 
              isOpened={isSelectShow} 
              cancelText='取消' 
              onCancel={()=>this.setState({isSelectShow: false})} 
              onClose={()=>this.setState({isSelectShow: false})}
            >
              <AtActionSheetItem onClick={this.toVotePage}>{identity == 1 ? '发起表决' : '参与表决'}</AtActionSheetItem>
              <AtActionSheetItem onClick={this.toElectPage}>{identity == 1 ? '发起选举' : '参与选举'}</AtActionSheetItem>
            </AtActionSheet>
          </View>
          {/* 退出会议按钮 */}
          <MovableView x={screenWidth} y={screenHeight/2} style={{width: '112rpx',height: '112rpx'}} className="quit_meeting" direction="all" inertia>
            <AtFab onClick={()=>this.setState({isModalOpen: true})}>
              <AtIcon prefixClass='icon-tuichuhuiyi' value="add" color="#fff" />
            </AtFab>
          </MovableView>
          <AtModal
            isOpened={isModalOpen}
            title='退出会议'
            cancelText='取消'
            confirmText='确认'
            content='确定退出该会议吗？'
            onCancel={()=>this.setState({isModalOpen: false})}
            onClose={()=>this.setState({isModalOpen: false})}
            onConfirm={this.quit}
          />

        </MovableArea>
      </View>
    );
  }
}
 
export default Home;