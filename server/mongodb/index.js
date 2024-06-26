var mongoose = require('mongoose');
const globalConfigUtils = require('../config/globalConfig')
const cacheDataUtils = require('../config/cacheData')
const rssToolUtils = require('../utils/rss')
const sitemapToolUtils = require('../utils/sitemap')
console.info('数据库连接中...');
// console.log('数据库地址：', process.env.DB_HOST);
if (!process.env.DB_HOST) {
  console.error('请在根目录下创建.env文件，并添加数据库地址。');
  process.exit(1);
}
mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;

db.once('open', async () => {
  console.info('数据库连接成功！');
  // 更新时注意同时更新还原时的缓存
  await globalConfigUtils.initGlobalConfig()
  cacheDataUtils.getNaviList()
  cacheDataUtils.getSidebarList()
  cacheDataUtils.getBannerList()
  cacheDataUtils.getSortList()
  cacheDataUtils.getPostArchiveList()
  cacheDataUtils.getBangumiYearList()
  rssToolUtils.reflushRSS()
  sitemapToolUtils.reflushSitemap()
})

db.on('error', function (error) {
  console.error(
    'Error in MongoDb connection: ' + error
  );
  mongoose.disconnect();
});

db.on('close', function () {
  console.error(
    '数据库断开，10秒后重新连接数据库'
  );
  setTimeout(() => {
    mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true });
  }, 10000);
});

module.exports = db;