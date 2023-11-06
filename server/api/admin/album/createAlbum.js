const chalk = require('chalk')
const albumUtils = require('../../../mongodb/utils/albums')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const fs = require('fs')
const path = require('path');

module.exports = async function (req, res, next) {

  const { name } = req.body
  // 校验格式
  const params = {
    name: name,
  }
  const rule = [
    {
      key: 'name',
      label: '相册名称',
      type: null,
      required: true,
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // name 只能支持英文数字组合
  const reg = /^[a-zA-Z0-9]+$/
  if (!reg.test(name)) {
    res.status(400).json({
      errors: [{
        message: '相册名称只能为英文数字组合'
      }]
    })
    return
  }
  // name不能重复
  const album = await albumUtils.findOne({ name })
  if (album) {
    res.status(400).json({
      errors: [{
        message: '相册名称已存在'
      }]
    })
    return
  }
  // save
  albumUtils.save(params).then((data) => {
    // 创建相册文件夹 /public/content/uploadfile/${name}
    const dir = path.join('./public/content/uploadfile', name)
    fs.mkdirSync(dir)

    res.send({
      data: data
    })
    adminApiLog.info(`album:${name} create success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '相册创建失败'
      }]
    })
    adminApiLog.error(`album:${name} create fail, ${JSON.stringify(err)}`)
  })

}
