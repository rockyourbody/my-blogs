var mongoose = require('mongoose');
//加载schemas中的文件
var contentsSchema = require('../schemas/contents');
// model方法创建模型，再暴露出去
module.exports = mongoose.model('Content', contentsSchema);