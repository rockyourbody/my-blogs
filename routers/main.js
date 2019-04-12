var express = require('express');
// 可使用 express.Router 类创建模块化、可挂载的路由句柄
var router = express.Router();
// 引入Category模型
var Category = require('../models/Category');
var Content = require('../models/Content');
// 声明一个对象，将数据都装入，便于渲染
var data;
//通用数据：获取分类信息
router.use(function(req, res, next) {
    data = {
        userInfo: req.userInfo,
        categories: []
    };
    // 分类数据获取 
    // data.categories = await Category.find()
    Category.find().then(function(categories) {
        data.categories = categories;
        next();
    });   
});
/**
 * 首页
 */
router.get('/', (req, res, next) => {        
    // 加入一个分类id，用来和点击导航栏的分类id匹配
    data.category = req.query.category || '';
    data.count = 0;
    data.page = Number(req.query.page || 1);
    data.limit = 3;
    data.pages = 0;
    
    // 添加一个条件，判断是否存在
    var where = {};
    if(data.category) {
        where.category = data.category;
    }
    Content.where(where).count().then(function(count) {
        // 赋值给data
        data.count = count;
        data.pages = Math.ceil(data.count / data.limit);
        data.page = Math.min(data.page, data.pages);
        data.page = Math.max(data.page, 1);
        var skip = (data.page - 1) * data.limit;
        
        // 读取内容
        return Content.where(where).find().sort({_id: -1}).limit(data.limit).skip(skip).populate(['category', 'user']).sort({
            addTime: -1
        });
        // 接收
    }).then(function(contents) {
        // 赋值给data
        data.contents = contents;
        // 第二个参数传入的对象是分配给模板去使用的数据
        res.render('main/index', data);
    })
});

/**
 * 阅读全文部分内容获取
 */
router.get('/view', function(req, res, next) {
    // "/view?contentid={{content.id}}"
    var contentId = req.query.contentid || '';
    Content.findOne({
        _id: contentId
    }).then(function(content) {
        data.content = content;
        // 阅读量设置
        content.views ++;
        content.save();
        res.render('main/view', data);
    });
});


    // contentid通过ajax传输进来
// 暴露这个router模块
module.exports = router;