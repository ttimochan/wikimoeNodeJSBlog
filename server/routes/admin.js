var express = require('express')
var router = express.Router()
const { checkJWT } = require('../utils/utils')

const userUtils = require('../mongodb/utils/users')

const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// jwt权限校验
const checkAuth = async (req, res, next) => {
  const jwtVersion = 1
  const token = req.headers['authorization']
  if (!token) {
    return res.status(401).json({ errors: [{ message: '认证失败' }] })
  }
  const decoded = checkJWT(token.split(' ')[1] || '')
  // console.log(decoded)
  if (!decoded.isError) {
    req.adminData = decoded
    if (decoded.data.version !== jwtVersion) {
      res.status(401).json({ errors: [{ message: '认证失败' }] })
    } else {
      const admin = await userUtils.findOne({ _id: req.adminData.data.id })
      if (!admin) {
        return res.status(403).json({ errors: [{ message: '该管理员账户已停止使用' }] })
      }
      if (admin.disabled) {
        return res.status(403).json({ errors: [{ message: '该管理员账户已停止使用' }] })
      } else if (admin.pwversion !== decoded.data.pwversion) {
        return res.status(401).json({ errors: [{ message: '认证失败' }] })
      }
      req.admin = admin
      next()
    }
  } else {
    res.status(401).json({ errors: [{ message: '认证失败' }] })
  }
}


// roleType 大于小于等于
// role 管理员的等级，配合上面的roleType使用
const adminRouteSetting = [
  {
    path: '/login',
    method: 'post',
    middleware: [],
    controller: require('../api/admin/login'),
    roleType: null,
    role: null
  },
  // get,loginuserinfo
  {
    path: '/loginuserinfo',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/user/getLoginUserInfo'),
    roleType: null,
    role: null
  },
  // put,updateLoginUserInfo
  {
    path: '/loginuserinfo',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/user/updateLoginUserInfo'),
    roleType: null,
    role: null
  },
  // post /sort/create
  {
    path: '/sort/create',
    method: 'post',
    middleware: [checkAuth],
    controller: require('../api/admin/sort/createSort'),
    roleType: null,
    role: null
  },
  // get /sort/list
  {
    path: '/sort/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/sort/getSortList'),
    roleType: null,
    role: null
  },
  // get /sort/detail
  {
    path: '/sort/detail',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/sort/getSortDetail'),
    roleType: null,
    role: null
  },
  // put /sort/update
  {
    path: '/sort/update',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/sort/updateSort'),
    roleType: null,
    role: null
  },
  // delete /sort/delete
  {
    path: '/sort/delete',
    method: 'delete',
    middleware: [checkAuth],
    controller: require('../api/admin/sort/deleteSort'),
    roleType: null,
    role: null
  },
  // get /tag/list
  {
    path: '/tag/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/tag/getTagList'),
    roleType: null,
    role: null
  },
  // post /tag/create
  {
    path: '/tag/create',
    method: 'post',
    middleware: [checkAuth],
    controller: require('../api/admin/tag/createTag'),
    roleType: null,
    role: null
  },
  // get /tag/detail
  {
    path: '/tag/detail',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/tag/getTagDetail'),
    roleType: null,
    role: null
  },
  // put /tag/update
  {
    path: '/tag/update',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/tag/updateTag'),
    roleType: null,
    role: null
  },
  // put /tag/update/lastusetime
  {
    path: '/tag/update/lastusetime',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/tag/updateTagLastusetime'),
    roleType: null,
    role: null
  },
  // delete /tag/delete
  {
    path: '/tag/delete',
    method: 'delete',
    middleware: [checkAuth],
    controller: require('../api/admin/tag/deleteTag'),
    roleType: null,
    role: null
  },
  // get /album/list
  {
    path: '/album/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/album/getAlbumList'),
    roleType: null,
    role: null
  },
  // post /album/create
  {
    path: '/album/create',
    method: 'post',
    middleware: [checkAuth],
    controller: require('../api/admin/album/createAlbum'),
    roleType: null,
    role: null
  },
  // get /album/detail
  {
    path: '/album/detail',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/album/getAlbumDetail'),
    roleType: null,
    role: null
  },
  // put /album/update
  {
    path: '/album/update',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/album/updateAlbum'),
    roleType: null,
    role: null
  },
  // delete /album/delete
  {
    path: '/album/delete',
    method: 'delete',
    middleware: [checkAuth],
    controller: require('../api/admin/album/deleteAlbum'),
    roleType: null,
    role: null
  },
  // post /attachment/upload
  {
    path: '/attachment/upload',
    method: 'post',
    middleware: [checkAuth, upload.single('file')],
    controller: require('../api/admin/attachment/uploadAttachment'),
    roleType: null,
    role: null
  },
  // get /attachment/list
  {
    path: '/attachment/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/attachment/getAttachmentList'),
    roleType: null,
    role: null
  },
  // delete /attachment/delete
  {
    path: '/attachment/delete',
    method: 'delete',
    middleware: [checkAuth],
    controller: require('../api/admin/attachment/deleteAttachment'),
    roleType: null,
    role: null
  },
  // put /attachment/update/info
  {
    path: '/attachment/update/info',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/attachment/updateAttachmentInfo'),
    roleType: null,
    role: null
  },
  // put /attachment/update/album
  {
    path: '/attachment/update/album',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/attachment/updateAttachmentAlbum'),
    roleType: null,
    role: null
  },
  // post /post/create
  {
    path: '/post/create',
    method: 'post',
    middleware: [checkAuth],
    controller: require('../api/admin/post/createPost'),
    roleType: null,
    role: null
  },
  // get /post/list
  {
    path: '/post/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/post/getPostList'),
    roleType: null,
    role: null
  },
  // get /post/detail
  {
    path: '/post/detail',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/post/getPostDetail'),
    roleType: null,
    role: null
  },
  // put /post/update
  {
    path: '/post/update',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/post/updatePost'),
    roleType: null,
    role: null
  },
  // delete /post/delete
  {
    path: '/post/delete',
    method: 'delete',
    middleware: [checkAuth],
    controller: require('../api/admin/post/deletePost'),
    roleType: null,
    role: null
  },
  // post /comment/create
  {
    path: '/comment/create',
    method: 'post',
    middleware: [checkAuth],
    controller: require('../api/admin/comment/createComment'),
    roleType: null,
    role: null
  },
  // get /comment/list
  {
    path: '/comment/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/comment/getCommentList'),
    roleType: null,
    role: null
  },
  // get /comment/detail
  {
    path: '/comment/detail',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/comment/getCommentDetail'),
    roleType: null,
    role: null
  },
  // put /comment/update
  {
    path: '/comment/update',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/comment/updateComment'),
    roleType: null,
    role: null
  },
  // delete /comment/delete
  {
    path: '/comment/delete',
    method: 'delete',
    middleware: [checkAuth],
    controller: require('../api/admin/comment/deleteComment'),
    roleType: null,
    role: null
  },
  // get /link/list
  {
    path: '/link/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/link/getlinkList'),
    roleType: null,
    role: null
  },
  // post /link/create
  {
    path: '/link/create',
    method: 'post',
    middleware: [checkAuth],
    controller: require('../api/admin/link/createlink'),
    roleType: null,
    role: null
  },
  // get /link/detail
  {
    path: '/link/detail',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/link/getlinkDetail'),
    roleType: null,
    role: null
  },
  // put /link/update
  {
    path: '/link/update',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/link/updatelink'),
    roleType: null,
    role: null
  },
  // delete /link/delete
  {
    path: '/link/delete',
    method: 'delete',
    middleware: [checkAuth],
    controller: require('../api/admin/link/deletelink'),
    roleType: null,
    role: null
  },
  // get /navi/list
  {
    path: '/navi/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/navi/getnaviList'),
    roleType: null,
    role: null
  },
  // post /navi/create
  {
    path: '/navi/create',
    method: 'post',
    middleware: [checkAuth],
    controller: require('../api/admin/navi/createnavi'),
    roleType: null,
    role: null
  },
  // get /navi/detail
  {
    path: '/navi/detail',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/navi/getnaviDetail'),
    roleType: null,
    role: null
  },
  // put /navi/update
  {
    path: '/navi/update',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/navi/updatenavi'),
    roleType: null,
    role: null
  },
  // delete /navi/delete
  {
    path: '/navi/delete',
    method: 'delete',
    middleware: [checkAuth],
    controller: require('../api/admin/navi/deletenavi'),
    roleType: null,
    role: null
  },
  // put /option/update
  {
    path: '/option/update',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/option/updateoption'),
    roleType: null,
    role: null
  },
  // get /option/list
  {
    path: '/option/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/option/getoptionList'),
    roleType: null,
    role: null
  },
  // get dashboard
  {
    path: '/dashboard',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/dashboard/getDashboard'),
    roleType: null,
    role: null
  },
  // get /sidebar/list
  {
    path: '/sidebar/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/sidebar/getSidebarList'),
    roleType: null,
    role: null
  },
  // post /sidebar/create
  {
    path: '/sidebar/create',
    method: 'post',
    middleware: [checkAuth],
    controller: require('../api/admin/sidebar/createSidebar'),
    roleType: null,
    role: null
  },
  // put /sidebar/update
  {
    path: '/sidebar/update',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/sidebar/updateSidebar'),
    roleType: null,
    role: null
  },
  // put /sidebar/update/taxis
  {
    path: '/sidebar/update/taxis',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/sidebar/updateSidebarTaxis'),
    roleType: null,
    role: null
  },
  // delete /sidebar/delete
  {
    path: '/sidebar/delete',
    method: 'delete',
    middleware: [checkAuth],
    controller: require('../api/admin/sidebar/deleteSidebar'),
    roleType: null,
    role: null
  },
  // get /banner/list
  {
    path: '/banner/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/banner/getBannerList'),
    roleType: null,
    role: null
  },
  // post /banner/create
  {
    path: '/banner/create',
    method: 'post',
    middleware: [checkAuth],
    controller: require('../api/admin/banner/createBanner'),
    roleType: null,
    role: null
  },
  // put /banner/update
  {
    path: '/banner/update',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/banner/updateBanner'),
    roleType: null,
    role: null
  },
  // put /banner/update/img
  {
    path: '/banner/update/img',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/banner/updateBannerImg'),
    roleType: null,
    role: null
  },
  // put /banner/update/taxis
  {
    path: '/banner/update/taxis',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/banner/updateBannerTaxis'),
    roleType: null,
    role: null
  },
  // delete /banner/delete
  {
    path: '/banner/delete',
    method: 'delete',
    middleware: [checkAuth],
    controller: require('../api/admin/banner/deleteBanner'),
    roleType: null,
    role: null
  },
  // getReaderlogList
  {
    path: '/readerlog/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/readerlog/getReaderlogList'),
    roleType: null,
    role: null
  },
  // getPostLikeLogList
  {
    path: '/postlikelog/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/postLikeLog/getPostLikeLogList'),
    roleType: null,
    role: null
  },
  // getCommentLikeLogList
  {
    path: '/commentlikelog/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/commentLikeLog/getCommentLikeLogList'),
    roleType: null,
    role: null
  },
  // createBangumi
  {
    path: '/bangumi/create',
    method: 'post',
    middleware: [checkAuth],
    controller: require('../api/admin/bangumi/createBangumi'),
    roleType: null,
    role: null
  },
  // deleteBangumi
  {
    path: '/bangumi/delete',
    method: 'delete',
    middleware: [checkAuth],
    controller: require('../api/admin/bangumi/deleteBangumi'),
    roleType: null,
    role: null
  },
  // getBangumiDetail
  {
    path: '/bangumi/detail',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/bangumi/getBangumiDetail'),
    roleType: null,
    role: null
  },
  // getBangumiList
  {
    path: '/bangumi/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/bangumi/getBangumiList'),
    roleType: null,
    role: null
  },
  // updateBangumi
  {
    path: '/bangumi/update',
    method: 'put',
    middleware: [checkAuth],
    controller: require('../api/admin/bangumi/updateBangumi'),
    roleType: null,
    role: null
  },
  // getEmailSendHistoryList
  {
    path: '/emailsendhistory/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/emailSendHistory/getEmailSendHistoryList'),
    roleType: null,
    role: null
  },
  // getReferrerList
  {
    path: '/referrer/list',
    method: 'get',
    middleware: [checkAuth],
    controller: require('../api/admin/referrer/getReferrerList'),
    roleType: null,
    role: null
  },
]

adminRouteSetting.forEach(item => {
  router[item.method](item.path, ...item.middleware, item.controller)
})

module.exports = router
