var mongoose = require('mongoose');
//加载schemas中的文件
var categoriesSchema = require('../schemas/categories');
// model方法创建模型，再暴露出去
module.exports = mongoose.model('Category', categoriesSchema);