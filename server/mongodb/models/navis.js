var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var navis = new Schema({
  naviname: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  newtab: {
    type: Boolean,
    default: false
  },
  // 状态 0 不显示 1 显示
  status: {
    type: Number,
    default: 0
  },
  // 排序
  taxis: {
    type: Number,
    default: 0
  },
  // 父导航
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'navis'
  },
  // 是否本站链接
  isdefault: {
    type: Boolean,
    default: false
  },
  // query
  query: {
    // object
    type: Object,
    default: {}
  },
}, { timestamps: true });

module.exports = mongoose.model('navis', navis);