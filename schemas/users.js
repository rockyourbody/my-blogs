// 加载mongoose模板
var mongoose = require('mongoose');
// 用户的表结构
// 将定义好的对象返回出去module.exports
module.exports = new mongoose.Schema({
    // 用户名
    username: String,
    // 密码
    password: String,
    // 是否为管理员
    isAdmin: {
        type: Boolean,
        default: false
    }
});