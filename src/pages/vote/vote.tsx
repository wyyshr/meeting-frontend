import { Text, View } from '@tarojs/components';
import * as React from 'react';
import './vote.scss'
import { getCurrentInstance } from '@tarojs/taro'
import { ajax } from '../../config/ajax';
import { PATH } from '../../config/path';
import { AtButton, AtFab, AtRadio, AtMessage, AtCurtain, AtModal, AtInput } from 'taro-ui';
import Taro from "@tarojs/taro";

interface AjaxResType<T> {
  code: number
  success: boolean
  data?: T
}
type VoteType = {
  id: number
  nickName: string
  title: string
  option1: string
  option2: string
  voteNum1: number
  voteNum2: number
  isEnd: boolean
}
export interface VoteProps {
  
}
 
export interface VoteState {
  identity: number
  voteContent: VoteType[]
  selectValue: string
  isAddVoteCurtailShow: boolean
  isModalOpen: boolean
  endId: number
  isCurtainShow: boolean
  voteResult: {option: string, num: number}[]
  title: string
  option1: string
  option2: string
}
 
class Vote extends React.Component<VoteProps, VoteState> {
  constructor(props: VoteProps) {
    super(props);
    this.state = {
      identity: 1,
      voteContent: [],
      selectValue: '',
      isAddVoteCurtailShow: false,
      isModalOpen: false,
      endId: 0,
      isCurtainShow: false,
      voteResult: [],
      title: '',
      option1: '',
      option2: '',
    };
  }
  componentDidMount() {
    const identity = parseInt(getCurrentInstance().router.params.identity)
    this.setState({identity})
    this.getVote()
  }
  // 获取表决内容
  async getVote(){
    const res = await ajax({ url: PATH.getVote });
    const result = res as AjaxResType<VoteType[]>
    result.code == 1 && result.success && this.setState({voteContent: result.data})
  }
  // 创建表决
  createVote = async () => {
    const { title, option1, option2 } = this.state
    const userInfo = Taro.getStorageSync('userInfo') || '';
    const user = userInfo as { nickName: string }
    const res = await ajax({ url: PATH.createVote, data: {nickName: user.nickName, title, option1, option2} })
    const result = res as AjaxResType<any>
    if(result.code == 1 && result.success){
      this.setState({isAddVoteCurtailShow: false})
      this.getVote()
    }
  }
  // 结束表决按钮
  cancleClick = id => this.setState({isModalOpen: true, endId: id})
  // 结束表决
  endVote = async () => {
    const { endId } = this.state
    const res = await ajax({ url: PATH.endVote, data: { id: endId } })
    const result = res as AjaxResType<any>
    if(result.code == 1 && result.success){
      this.setState({isModalOpen: false})
      this.getVoteResult()
    }
  }
  // 获取表决结果
  async getVoteResult(){
    const { endId } = this.state
    const res = await ajax({ url: PATH.getVoteResult, data: { id: endId } })
    const result = res as AjaxResType<{option: string, num: number}[]>
    if(result.code == 1 && result.success){
      this.setState({ voteResult: result.data, isCurtainShow: true })
    }
  }
  // 选项选择
  handleOptionClick = e => this.setState({selectValue: e});
  // 提交
  submit = async id => {
    const { selectValue } = this.state
    const vote = Taro.getStorageSync('vote') || [];
    const votes = vote as Array<String>
    if(!selectValue) return Taro.atMessage({'message': '请选择一项', 'type': 'error'})
    for (let i = 0; i < votes.length; i++) {
      const v = votes[i];
      if(v == id) return Taro.atMessage({'message': '已经投过该表决了', 'type': 'error'})
    }
    const res = await ajax({ url: PATH.vote, data: {id, option: selectValue} })
    const result = res as AjaxResType<any>
    votes.push(id)
    if(result.code == 1 && result.success){
      Taro.atMessage({'message': '投票成功', 'type': 'success'})
      Taro.setStorageSync('vote',votes)
    } 
  }
  // 标题输入
  handleTitleChange = e => this.setState({title: e});
  // 选项输入
  handleOption1Change = e => this.setState({option1: e});
  handleOption2Change = e => this.setState({option2: e});

  render() { 
    const { identity, voteContent, selectValue, title, option1, option2, isModalOpen, isAddVoteCurtailShow, isCurtainShow, voteResult } = this.state
    const resultArr = voteResult.map(v => v.num);
    const oneWidth = 100/Math.max(...resultArr);
    const votes = voteContent.map(v => {
      return {
        id: v.id,
        title: v.title,
        nickName: v.nickName,
        options: [
          { label: v.option1, value: v.option1 },
          { label: v.option2, value: v.option2 },
        ]
      }
    })
    return (
      <View className="vote_page">
        <AtMessage />
        <AtModal
          isOpened={isModalOpen}
          title='结束并查看'
          cancelText='取消'
          confirmText='确认'
          content='确定关闭该表决并查看表决结果吗？'
          onCancel={()=>this.setState({isModalOpen: false})}
          onClose={()=>this.setState({isModalOpen: false})}
          onConfirm={this.endVote}
        />
        {/* 表决结果 */}
        <AtCurtain
          isOpened={isCurtainShow}
          closeBtnPosition="top-right"
          onClose={()=>this.setState({isCurtainShow: false})}
        >
          <View className="curtain_nav">
            {
              voteResult.map(v => <View className="item">
                <View className="option">{v.option}：</View>
                <View className="num">
                  <View style={{width: `${oneWidth * v.num}%`}}>{v.num}</View>
                </View>
              </View>)
            }
          </View>
        </AtCurtain>
        {/* 添加表决 */}
        <AtCurtain
          isOpened={isAddVoteCurtailShow}
          onClose={()=>this.setState({isAddVoteCurtailShow: false})}
          closeBtnPosition="top-right"
        >
          <View className="add_nav">
            {/* 标题 */}
            <View className="title">
              <AtInput
                name="title"
                title="表决标题"
                type="text"
                placeholder="请输入表决标题"
                value={title}
                onChange={this.handleTitleChange}
              />
            </View>
            {/* 选项 */}
            <View className="option_nav">
              <AtInput 
                name="option1"
                title='表决选项1'
                type="text"
                value={option1}
                onChange={this.handleOption1Change}
              />
              <AtInput 
                name="option2"
                title='表决选项2'
                type="text"
                value={option2}
                onChange={this.handleOption2Change}
              />
            </View>
            {/* 确定按钮 */}
            <View className="footer_btn">
              <AtButton size="small" onClick={()=>this.setState({isAddVoteCurtailShow: false})}>取消</AtButton>
              <AtButton size="small" type="primary" onClick={this.createVote}>确定</AtButton>
            </View>
          </View>
        </AtCurtain>
        {/* 表决内容 */}
        <View className="vote_content at-article">
          {
            voteContent.length > 0 ? 
            votes.map((v, i) => <View className="vote_item">
              <View className="top">
                <View className="title_nav">
                  <View className="title at-article__h2">{i+1}、{v.title}</View>
                  <View className="at-article__info">发起人：{v.nickName}</View>
                </View>
                {/* 关闭表决并查看详细 */}
                {
                  identity == 1 && <View className="close_btn">
                    <AtButton size='small' type="primary" onClick={()=>{this.cancleClick(v.id)}} ><Text className='at-icon at-icon-close'></Text></AtButton>
                  </View>
                }
              </View>
              <View className="options_nav">
                <AtRadio options={v.options} value={selectValue} onClick={this.handleOptionClick} />
              </View>
              {/* 提交按钮 */}
              <View className="submit_btn">
                <View className="submit_btn_nav"><AtButton type="primary" onClick={()=>{this.submit(v.id)}}>确定</AtButton></View>
              </View>
            </View>) : 
            <View className="no-data">暂无表决</View>
          }
        </View>
        {/* 创建表决按钮 */}
        {
          identity == 1 && <View className="add_btn">
            <AtFab onClick={()=>this.setState({isAddVoteCurtailShow: true})}>
              <Text className='at-fab__icon at-icon at-icon-add'></Text>
            </AtFab>
          </View>
        }
      </View>
    );
  }
}
 
export default Vote;