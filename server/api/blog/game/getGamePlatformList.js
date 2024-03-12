const gamePlatformUtils = require('../../../mongodb/utils/gamePlatforms')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  const params = {
  }


  const sort = {
    _id: -1
  }
  gamePlatformUtils.find(params, sort, '_id color name').then((data) => {
    // 返回格式list,total
    res.send({
      data: data,
    })

  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '游戏平台列表获取失败'
      }]
    })
    userApiLog.error(`gamePlatform list get fail, ${JSON.stringify(err)
      }`)
  })
}
