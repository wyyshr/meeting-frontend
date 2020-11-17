export const PATH = {
  login: '/user/login',                             // 登录
  getInMeetingUser: '/user/getInMeetingUser',       // 获取观众
  
  createElect: '/elect/new',                        // 创建选举
  getElect: '/elect/getElect',                      // 获取选举内容
  elect: '/elect',                                  // 观众选举投票
  endElect: '/elect/endElect',                      // 结束选举
  getElectResult: '/elect/getElectResult',          // 获取选举结果

  createVote: '/vote/new',                          // 创建表决
  getVote: '/vote/getVote',                         // 获取表决内容
  vote: '/vote',                                    // 观众表决投票
  endVote: '/vote/endVote',                         // 结束表决
  getVoteResult: '/vote/getVoteResult',             // 获取表决结果
}