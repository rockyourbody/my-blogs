// 加载express模块
var express = require('express');
// 创建一个路由对象
var router = express.Router();
// 引入用户模型
var User = require('../models/User');
// 引入分类模型
var Category = require('../models/Category');
// 引入内容模型
var Content = require('../models/Content');
// 对当前登录身份进行验证
router.use(function(req, res, next) {
    if(!req.userInfo.isAdmin) {
        // 如果当前用户是非管理员
        res.send('对不起，只有管理员才可以进入后台管理');
        return;
    }
    next();
});

// 路由绑定，方法相同
/**
 * 首页
 */
router.get('/', (req, res, next) => {
    res.render('admin/index', {
        userInfo: req.userInfo
    });
});

/**
 * 用户管理
 */
router.get('/user', (req, res, next) => {
    /**
     * 从数据库中读取所有的用户数据
     * 
     * limit(number):限制获取的数据条数
     * 
     * skip(2):忽略数据的条数
     * 
     * 每页显示两条
     * 1：1-2 skip：0 -> （当前页 - 1）* limit
     * 2：3-4 skip：2 ->
     */
    // 当前页数
    var page = Number(req.query.page || 1);
    // 限制数据
    var limit = 3;
    // 总页数
    var pages = 0;
    // 原视频未设置公共部分，因此这里加上
    var user = 'user';
    // 获取数据总条数：count
    // 由于产生异步，因此将find()放到count()之内
    User.count().then(function(count) {
        // 计算总页数
        pages = Math.ceil(count / limit);
        // 取值不能超过pages
        page = Math.min(page, pages);
        // 取值不能小于1
        page = Math.max(page, 1);
        // 忽略的数据
        var skip = (page - 1) * limit;
        // 从数据库中读取所有用户数据
        User.find().limit(limit).skip(skip).then(function(users) {
            // 读取数据后将用户记录传递给模板展现出来
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                page: page,
                limit: limit,
                count: count,
                pages: pages,
                title: user
            });
        });
    });
    
});

/**
 * 分类首页
 * 参照上面设置分页
 */
router.get('/category', function(req, res, next) {
    // res.render('admin/category_index', {
    //     userInfo: req.userInfo
    // });
    var page = Number(req.query.page || 1);
    var limit = 6;
    var pages = 0;
    var category = 'category';

    Category.count().then(function(count) {
        
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        /**
         * sort()排序
         * 1：升序
         * -1：降序
         */
        Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function(categories) {
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                categories: categories,
                page: page,
                limit: limit,
                count: count,
                pages: pages,
                title: category
            });
        });
    });
});

/**
 * 分类的添加
 */
router.get('/category/add', function(req, res, next) {
    res.render('admin/category_add', {
        userInfo: req.userInfo
    });
});

/**
 * 分类的保存
 */
router.post('/category/add', function(req, res, next) {
    var name = req.body.name || '';
    // 输入是否为空
    if(name == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '名称不能为空'
        });
        return;
    }
    // 数据库中是否已经存在同名分类名称
    Category.findOne({
        name: name
    }).then(function(rs) {
        if(rs) {
            // 数据库中已经存在该分类
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类已经存在'
            })
            return Promise.reject();
        } else {
            // 数据库中不存在该分类，可以保存
            return new Category({
                name: name
            }).save();
        }
    }).then(function(newCategory) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类保存成功',
            url: '/admin/category'
        });
    });
});

/**
 * 分类修改
 */
router.get('/category/edit', function(req, res, next) {
    // 获取要修改分类的信息，并且用表单的形式表示出来
    var id = req.query.id || '';
    // 获取要修改的分类信息
    Category.findOne( {
        // 狗日的，找了一宿，少写了个横杠
        _id: id
    }).then(function(category) {
        if(!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在'
            });
            return Promise.reject();
        } else {
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category: category
            });
        }
    });
});

/**
 * 分类修改后的保存
 */
router.post('/category/edit', function(req, res, next) {
    // 获取要修改的分类信息，并且用表单形式展现出来
    var id = req.query.id || '';
    // 获取post提交过来的名称
    var name = req.body.name || '';
    // 获取要修改的分类信息
    Category.findOne( {
        _id: id
    }).then(function(category) {
        if(!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在'
            });
            return Promise.reject();
        } else {
            // 当用户没有做任何的修改提交的时候
            if(name == category.name) {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '修改成功',
                    url: '/admin/category'
                });
                return Promise.reject();
            } else {
                // 要修改的分类名称是否已经在数据库中存在
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                });
            }
        }
    }).then(function(sameCategory) {
        if(sameCategory) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '数据库中已经存在同名分类',
            });
            return Promise.reject();
        } else {
            return Category.update({
                _id: id
            }, {
                name: name
            });
        }
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '修改成功',
            url: '/admin/category'
        });
    })
});

// 分类删除
router.get('/category/delete', function(req, res, next) {
    // 获取要删除的分类id
    var id = req.query.id || '';
    Category.remove({
        _id: id
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/category'
        });
    });
});

/**
 * 内容首页
 */
router.get('/content', function(req, res, next) {
    // res.render('admin/content_index', {
    //     userInfo: req.userInfo
    // });
    var page = Number(req.query.page || 1);
    var limit = 6;
    var pages = 0;
    var content = 'content';

    Content.count().then(function(count) {
        
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        //由于schemas数据结构中，category关联了Category中的数据，因此用populate()方法可以调用其中数据
        Content.find().sort({_id: -1}).limit(limit).skip(skip).populate(['category', 'user']).sort({
            addTime: -1
        }).then(function(contents) {
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,
                page: page,
                limit: limit,
                count: count,
                pages: pages,
                title: content
            });
        });
    });
});

/**
 * 内容添加页面
 */
router.get('/content/add', function(req, res, next) {
    Category.find().sort({_id: -1}).then(function(categories) {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories
        });
    });
});

/**
 * 内容保存
 */
router.post('/content/add', function(req, res, next) {
    // 验证id和标题不能为空
    if(req.body.category == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        });  
        return;
    };
    if(req.body.title == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        });  
        return;
    };
    // 保存内容到数据库
    new Content({
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        // 当前登录的用户id
        user: req.userInfo._id.toString()
    }).save().then(function(rs) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content'
        }); 
    });
});

/**
 * 内容修改
 */
router.get('/content/edit', function(req, res, next) {
    // 获取要修改分类的信息，并且用表单的形式表示出来
    var id = req.query.id || '';
    var categories = [];
    Category.find().sort({_id: -1}).then(function(rs) {
        categories = rs;
        // 获取要修改的分类信息
        return Content.findOne( {
            // 狗日的，找了一宿，少写了个横杠
            _id: id
        /** 由于“内容修改页面”中，“内容分类”是从schema数据结构部分引入的，因此递增递减顺序没变，
        和要修改的内容对应不上，因此这里需要再次应用populate()方法，这样取得的id就是对应内容的id，
        此时对两个id进行判断操作即可*/
        }).populate('category');
    }).then(function(content) {
        if(!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '指定内容不存在'
            });
            return Promise.reject();
        } else {
            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                categories: categories,
                content: content
            });
        }
    });
});

/**
 * 内容修改后的保存
 */
router.post('/content/edit', function(req, res, next) {

    var id = req.query.id || '';
    // 实际业务可能还需要考虑是否重复等等复杂问题
    if(req.body.category == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        });  
        return;
    };
    if(req.body.title == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        });  
        return;
    };

    Content.update({
        _id: id
    }, {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content'
        });
    });  
});

// 内容删除
router.get('/content/delete', function(req, res, next) {
    // 获取要删除的分类id
    var id = req.query.id || '';
    Content.remove({
        _id: id
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/content'
        });
    });
});

// 将数据返回出去
module.exports = router;
