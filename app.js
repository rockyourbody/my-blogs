/**
 * 应用程序入口
 **/
// 加载express模块
var express = require('express');
// 加载模板处理模块
var swig = require('swig');
// 加载数据库模块
var mongoose = require('mongoose');
// 加载body-parser,用来处理post提交过来的数据
var bodyParser = require('body-parser');
// 加载cookies模块
var Cookies = require('cookies');
// 调用express，创建app应用 => node.js http.createserver();
var app = express();
// 引入用户模型
var User = require('./models/User');
// 设置静态文件托管
// 当用户访问的url以/public开始，则返回对应的__dirname + '/public'目录下
app.use('/public', express.static(__dirname + '/public'))
// 配置应用模板
// 定义当前运用所使用的模板引擎
// 第一个参数：模板引擎的名称，同时也是模板文件的后缀，第二个参数表示用于解析处理模板内容的方法；
app.engine('html', swig.renderFile);
// 设置模板文件存放的目录，第一个参数必须是views，第二个参数是目录
app.set('views', './views');
// 注册所使用的模板引擎，第一个参数必须是view engine，第二个参数和app.engine这个方法中定义的模板引擎名称（参数）是一致的；
app.set('view engine', 'html');
// 在开发过程中，需要取消模板缓存，便于开发阶段调试
swig.setDefaults({
    cache: false
});
// bodyParser设置
app.use(bodyParser.urlencoded({
    extended: true
}));
// Cookies设置
app.use(function(req, res, next) {
    req.cookies = new Cookies(req, res);
    // 解析登录用户的cookie信息
    // 因此需要设置一个全局的，能被任何一个路由访问的变量
    req.userInfo = {};
    if(req.cookies.get('userInfo')) {
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            // 获取当前登录的用户类型
            // 获取用户输入的信息
            User.findById(req.userInfo._id).then(function(userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })
        }catch(e){
            next();
        }
    }else {
        // 千万别忘了next()
        next();
    }
});
/**
 * 首页
 * req request对象
 * res response对象
 * next 函数
 */
// app.get('/', (req, res, next) => {
    /** 
     * 读取views目录下的指定文件，解析并返回给客户端；
     * 第一个参数：表示模板文件，相对于views目录 views/index.html;
     * 第二个参数：传递给模板使用的数据
    */
    // res.render('index');
// })

/**
 * 根据不同的模块划分文件
 * 第一个参数指的是路由，第二个指的是请求文件
 * 即：用户访问了第一个参数的路由，则统统加载请求处理routers中的js文件
 */
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));
// 链接数据库
mongoose.connect('mongodb://localhost:27018/Blog', {useNewUrlParser:true}, (err) => {
    if(err) {
        console.log('数据库连接失败');
    } else {
        console.log('数据库连接成功');
        // 监听http请求
        app.listen(8081);        
    }
})


