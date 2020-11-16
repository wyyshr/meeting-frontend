import { View } from '@tarojs/components';
import * as React from 'react';
import './vote.scss'
import { getCurrentInstance } from '@tarojs/taro'

export interface VoteProps {
  
}
 
export interface VoteState {
  identity: number
}
 
class Vote extends React.Component<VoteProps, VoteState> {
  constructor(props: VoteProps) {
    super(props);
    this.state = {
      identity: 1
    };
  }
  componentDidMount() {
    const identity = parseInt(getCurrentInstance().router.params.identity)
    this.setState({identity})
  }
  render() { 
    const { identity } = this.state
    return (
      <View className="vote_page">Vote</View>
    );
  }
}
 
export default Vote;