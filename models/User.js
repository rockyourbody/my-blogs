var mongoose = require('mongoose');
//加载schemas中的文件
var usersSchema = require('../schemas/users');
// model方法创建模型，再暴露出去
module.exports = mongoose.model('User', usersSchema);