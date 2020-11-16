import { Text, View } from '@tarojs/components';
import * as React from 'react';
import { ajax } from '../../config/ajax';
import { PATH } from '../../config/path';
import Taro from "@tarojs/taro";
import './elect.scss'
import { AtFab, AtRadio, AtButton, AtMessage, AtModal, AtCurtain, AtInput } from 'taro-ui'
import { getCurrentInstance } from '@tarojs/taro'

interface AjaxResType<T> {
  code: number
  success: boolean
  data?: T
}
type electType = {
  id: number
  nickName: string
  title: string
  option: string
  electNums: string
  isEnd: boolean
}
export interface ElectProps {
  
}
 
export interface ElectState {
  electContent: electType[]
  selectValue: string
  isModalOpen: boolean
  endId: number
  isCurtainShow: boolean
  electResult: {option: string, num: string}[]
  isAddElectCurtailShow: boolean
  title: string
  options: Array<string>
  optionIndex: number
}
 
class Elect extends React.Component<ElectProps, ElectState> {
  constructor(props: ElectProps) {
    super(props);
    this.state = {
      electContent: [],    // 选举内容
      selectValue: '',     // 选择的选项
      isModalOpen: false,  // 是否打开弹框
      endId: 0, // 结束选举id
      isCurtainShow: false, // 是否打开选举结果幕帘
      electResult: [],  // 投票结果
      isAddElectCurtailShow: false, // 是否打开添加选举幕帘
      title: '',  // 选举标题
      options: ['',''],  // 选举选项
      optionIndex: 0,  // 选项索引
    };
  }
  componentDidMount(){
    this.getElect()
  }
  // 获取选举内容
  getElect = async () => {
    const res = await ajax({ url: PATH.getElect })
    const result = res as AjaxResType<electType[]>
    result.code == 1 && result.success && this.setState({electContent: result.data})
  }
  // 主持人创建选举
  createElect = async () => {
    const userInfo = Taro.getStorageSync('userInfo') || '';
    const user = userInfo as { nickName: string }
    const { title, options } = this.state
    const data = {
      nickName: user.nickName,
      title,
      option: options.join(',')
    }
    const res = await ajax({ url: PATH.createElect, data })
    const result = res as AjaxResType<any>
    if(result.code == 1 && result.success){
      this.setState({isAddElectCurtailShow: false})
      this.getElect()
    }
  }
  // 选择选项
  handleOptionClick = (e) => this.setState({selectValue: e})
  // 结束选举按钮
  cancleClick = id => {
    this.setState({isModalOpen: true, endId: id})
  }
  // 结束选举
  endElect = async () => {
    const { endId } = this.state
    const res = await ajax({ url: PATH.endElect, data: { id: endId } })
    const result = res as AjaxResType<any>
    if(result.code == 1 && result.success){
      this.setState({isModalOpen: false})
      this.getElectResult()
    }
  }
  // 获取选举结果
  getElectResult = async () => {
    const { endId } = this.state
    const res = await ajax({ url: PATH.getElectResult, data: { id: endId } })
    const result = res as AjaxResType<{option: string, num: string}[]>
    if(result.code == 1 && result.success){
      this.setState({ electResult: result.data, isCurtainShow: true })
    }
  }
  // 标题输入
  handleTitleChange = e => this.setState({title: e})
  // 选项输入
  handleOptionChange = e => {
    const { options, optionIndex } = this.state
    options[optionIndex] = e
    this.setState({ options })
  }
  // 添加选项
  addOptions = () => {
    const { options } = this.state
    options.push('')
    this.setState({options})
  }
  // 提交
  submit = async id => {
    const { selectValue } = this.state
    const elect = Taro.getStorageSync('elect') || [];
    const elects = elect as Array<String>
    if(!selectValue) return Taro.atMessage({'message': '请选择一项', 'type': 'error'})
    for (let i = 0; i < elects.length; i++) {
      const v = elects[i];
      if(v == id) return Taro.atMessage({'message': '已经投过该选举了', 'type': 'error'})
    }
    const res = await ajax({ url: PATH.elect, data: {id, option: selectValue} })
    const result = res as AjaxResType<any>
    elects.push(id)
    if(result.code == 1 && result.success){
      Taro.atMessage({'message': '投票成功', 'type': 'success'})
      Taro.setStorageSync('elect',elects)
    } 
  }

  render() { 
    const identity = parseInt(getCurrentInstance().router.params.identity)
    const { electContent, selectValue, isModalOpen, isCurtainShow, electResult, isAddElectCurtailShow, title, options } = this.state
    const resultArr = electResult.map(v => parseInt(v.num));
    const oneWidth = 100/Math.max(...resultArr);
    const elects = electContent.map(v => {
      return {
        id: v.id,
        title: v.title,
        option: v.option.split(',').map(item => { return { label: item, value: item } }),
        nickName: v.nickName
      }
    })
    return (
      <View className="elect_page">
        <AtMessage />
        <AtModal 
          isOpened={isModalOpen}
          title='结束并查看'
          cancelText='取消'
          confirmText='确认'
          content='确定关闭该选举并查看选举结果吗？'
          onCancel={()=>this.setState({isModalOpen: false})}
          onClose={()=>this.setState({isModalOpen: false})}
          onConfirm={this.endElect}
        />
        {/* 选举结果 */}
        <AtCurtain
          isOpened={isCurtainShow}
          closeBtnPosition="top-right"
          onClose={()=>this.setState({isCurtainShow: false})}
        >
          <View className="curtain_nav">
            {
              electResult.map(v => <View className="item">
                <View className="option">{v.option}：</View>
                <View className="num">
                  <View style={{width: `${oneWidth * parseInt(v.num)}%`}}>{v.num}</View>
                </View>
              </View>)
            }
          </View>
        </AtCurtain>
        <AtCurtain
          isOpened={isAddElectCurtailShow}
          onClose={()=>this.setState({isAddElectCurtailShow: false})}
          closeBtnPosition="top-right"
        >
          <View className="add_nav">
            {/* 标题 */}
            <View className="title">
              <AtInput 
                name="title"
                title="选举标题"
                type="text"
                placeholder="请输入选举标题"
                value={title}
                onChange={this.handleTitleChange}
              />
            </View>
            {/* 选项 */}
            <View className="option_nav">
              {
                options.map((v, i) => <AtInput 
                  name={`option${i}`}
                  title={`选举选项${i+1}`}
                  type="text"
                  placeholder="请输入选举标题"
                  value={v}
                  onChange={this.handleOptionChange}
                  onFocus={()=>this.setState({optionIndex: i})}
                />)
              }
            </View>
            {/* 新增按钮 */}
            <View className="add_options_btn">
              <AtButton size="small" onClick={this.addOptions}><Text className='at-icon at-icon-add'> </Text> 添加选项</AtButton>
            </View>
            {/* 确定按钮 */}
            <View className="footer_btn">
              <AtButton size="small" onClick={()=>this.setState({isAddElectCurtailShow: false})}>取消</AtButton>
              <AtButton size="small" type="primary" onClick={this.createElect}>确定</AtButton>
            </View>
          </View>
        </AtCurtain>
        {/* 选举内容 */}
        <View className="elect_content at-article">
          {
            electContent.length > 0 ?
            elects.map((v, i) => <View className="elect_item">
              <View className="top">
                <View className="title_nav">
                  <View className="title at-article__h2">{i+1}、{v.title}</View>
                  <View className="at-article__info">发起人：{v.nickName}</View>
                </View>
                {/* 关闭选举并查看详细 */}
                {
                  identity == 1 && <View className="close_btn">
                    <AtButton size='small' type="primary" onClick={()=>{this.cancleClick(v.id)}} ><Text className='at-icon at-icon-close'></Text></AtButton>
                  </View>
                }
              </View>
              <View className="options_nav">
                <AtRadio options={v.option} value={selectValue} onClick={this.handleOptionClick} />
              </View>
              {/* 提交按钮 */}
              <View className="submit_btn">
                <View className="submit_btn_nav"><AtButton type="primary" onClick={()=>{this.submit(v.id)}}>确定</AtButton></View>
              </View>
            </View>) :
            <View className="no-data">暂无选举</View>
          }
        </View>
        {/* 创建选举按钮 */}
        {
          identity == 1 && <View className="add_btn">
            <AtFab onClick={()=>this.setState({isAddElectCurtailShow: true})}>
              <Text className='at-fab__icon at-icon at-icon-add'></Text>
            </AtFab>
          </View>
        }
        
      </View>
    );
  }
}
 
export default Elect;