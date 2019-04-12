var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Content = require('../models/Content');
// 定义统一返回格式
var responseData;
router.use(function(req, res, next) {
    responseData = {
        code: 0,
        message: ''
    }
    next();
})
/**
 * 用户注册
 *   注册逻辑
 *   1.用户名不能为空
 *   2.密码不能为空
 *   3.两次输入密码必须一致
 *   4.用户是否已经被注册：数据库查询
 */
router.post('/user/register', (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    // 用户名不能为空
    if(username == '') {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        // 将结果返回前端，即上个错误，下面就不需要执行
        res.json(responseData);
        return;
    }
    // 密码不能为空
    if(password == '') {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }
    // 两次输入的密码不一致G:\Blogs-project\dbG:\Blogs-project\db
    if(repassword != password) {
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致';
        res.json(responseData);
        return;
    }
    // 用户名是否已经被注册，如果和数据库重名，表示该用户名已经被注册
    // 用promise方法处理回调函数，防止出现callback hell现象
    User.findOne({
        username: username
    }).then(function(userInfo) {
        if(userInfo) {
            // 不存在的话返回null
            // 表示数据库有记录
            responseData.code = 4;
            responseData.message = '用户名已经被注册';
            res.json(responseData);
            return;
        }
        // 保存用户注册的信息到数据库中
        // 通过操作对象来操作数据库
        var user = new User({
            username : username,
            password : password
        });
        return user.save();
    }).then(function(newUserInfo) {
        responseData.message = '注册成功';
        responseData.newUserInfo = {
            _id: newUserInfo._id,
            username: newUserInfo.username
        }
        req.cookies.set('userInfo', JSON.stringify({
            _id: newUserInfo._id,
            username: newUserInfo.username
        }));
        res.json(responseData);
        return;
    });
});
/**
 * 用户登录
 */
router.post('/user/login', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    if(username == '' || password == '') {
        responseData.code = 1;
        responseData.message = '用户名和密码不能为空';
        res.json(responseData);
        return;
    }
    // 查询数据库中用户名和密码的记录是否存在，如果存在则登录成功
    User.findOne({
        username: username,
        password: password
    }).then(function(userInfo) {
        if(!userInfo) {
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }
        // 用户名和密码正确
        responseData.message = '登录成功';
        // 登录信息
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        }
        // 发送一个cookie信息至浏览器
        // 第一个参数为存储位置，第二个为转换成字符串
        req.cookies.set('userInfo', JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }));
        // 返回登录信息
        res.json(responseData);
        return;
    });
});
/** 
 * 推出
 */
router.get('/user/logout', function(req, res, next) {
    req.cookies.set('userInfo', null);
    responseData.message = '退出成功';
    res.json(responseData);
});

/**
 * 评论提交
 */
router.post('/comment/post', function(req, res, next) {
    // 内容id
    var contentId = req.body.contentid || '';
    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    };
    // 查询当前内容的信息
    Content.findOne({
        _id : contentId
    }).then(function(content) {
        content.comments.push(postData);
        return content.save();
    }).then(function(newContent) {
        responseData.message = '评论成功';
        responseData.data = newContent;
        res.json(responseData);
    });
});

/**
 * 刷新：获取指定文章的所有评论
 */
router.get('/comment', function(req, res, next) {
    var contentId = req.query.contentid || '';
    Content.findOne({
        _id : contentId
    }).then(function(content) {
        responseData.data = content.comments;
        res.json(responseData);
    });
}); 


module.exports = router;