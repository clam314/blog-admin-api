import { getJWTPayload } from '@/common/Utils'
import Post from '@/model/Post'
import PostHistory from '@/model/PostHistory'
import User from '@/model/User'
import UserCollect from '@/model/UserCollect'
import Comments from '@/model/Comments'
import CommentsHands from '@/model/CommentsHands'
import SignRecord from '@/model/SignRecord'

/**
 * 统计相关的 api 放在这里
 */
class StatisticsController {
  // 统计数据：最近浏览、我的帖子、收藏夹、我的评论、我的点赞、获赞、个人积分
  async wxUserCount (ctx) {
    const body = ctx.query
    const obj = await getJWTPayload(ctx.header.authorization)
    const uid = obj._id
    const countMyHistory = body.reqHistory && await PostHistory.queryCount({ uid }) // 最近浏览
    const countMyPost = body.reqPost && await Post.queryCount({ uid }) // 我的帖子
    const countMyCollect = body.reqCollect && await UserCollect.queryCollectCount({ uid }) // 收藏夹
    const countMyComment = body.reqComment && await Comments.countDocuments({ cuid: uid }) // 我的评论
    const countMyHands = body.reqHands && await CommentsHands.countDocuments({ uid }) // 我的点赞
    const countHandsOnMe = body.reqHandsOnMe && await CommentsHands.countDocuments({ commentAuth: uid }) // 获赞
    const countFavs = body.reqFavs && await User.getFavs(uid) // 个人积分
    const lastSigned = body.reqLastSigned && await SignRecord.findByUid(uid) // 获取用户最新的签到日期

    ctx.body = {
      countMyPost,
      countMyCollect,
      countMyComment,
      countMyHands,
      countHandsOnMe,
      countMyHistory,
      countFavs,
      lastSigned
    }
  }
}

export default new StatisticsController()
