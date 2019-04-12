var mongoose = require('mongoose');
// 分类的表结构
module.exports = new mongoose.Schema({
    // 关联字段 - 内容分类的id
    category: {
        // 类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        // 当我们读取category时，可以关联另外一个模型
        ref: 'Category'
    },
    // 内容标题
    title: String,
    // 用户id
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // 增加时间
    addTime: {
        type: Date,
        default: new Date()
    },
    // 阅读量
    views: {
        type: Number,
        default: 0
    },
    // 简介
    description: {
        type: String,
        default: ''
    },
    // 内容
    content: {
        type: String,
        default: ''
    },
    // 评论
    comments: {
        type: Array,
        default: []
    }
});