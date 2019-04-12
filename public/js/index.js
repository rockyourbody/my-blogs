$(function() {
    var $loginBox = $('#loginBox');
    var $registerBox = $('#registerBox');
    var $userInfo = $('#userInfo');
    var $logout = $('#logout');
    // 切换到注册面板
    $loginBox.find('a.colMint').on('click', function() {
        $registerBox.show();
        $loginBox.hide();
    });
    // 切换到登录面板
    $registerBox.find('a.colMint').on('click', function() {
        $loginBox.show();
        $registerBox.hide();
    });
    // 注册
    $registerBox.find('button').on('click', function() {
        // 通过ajax提交请求
        // 后端提供接口，根据接口编写ajax的参数，根据后端返回的数据，处理前端的逻辑
        $.ajax({
            type: 'post',
            url: '/api/user/register',
            data: {
                username: $registerBox.find('[name="username"]').val(),
                password: $registerBox.find('[name="password"]').val(),
                repassword: $registerBox.find('[name="repassword"]').val()
            },
            dataType: 'json',
            success: function(result) {
                // 提示信息
                $registerBox.find('.colWarning').html(result.message);
                // 判断code的数值
                if(!result.code) {
                    //注册成功
                    setTimeout(function() {
                        //直接登录
                        window.location.reload();
                        // 跳转到登录页面
                        // $loginBox.show();
                        // $registerBox.hide();
                    },1000);
                }
            }
        });
    });
    // 登录
    $loginBox.find('button').on('click', function() {
        $.ajax({
            type: 'post',
            url: '/api/user/login',
            data: {
                username: $loginBox.find('[name="username"]').val(),
                password: $loginBox.find('[name="password"]').val()
            },
            dataType: 'json',
            success: function(result) {
                $loginBox.find('.colWarning').html(result.message);
                if(!result.code) {
                    // 登录成功
                    setTimeout(function() {
                        window.location.reload();
                        // $loginBox.hide();
                        // $userInfo.show();
                        // // 显示登录用户的信息
                        // $userInfo.find('.username').html(result.userInfo.username);
                        // $userInfo.find('.info').html('你好，欢迎光临我的博客');
                    }, 1000);
                }
            }
        })
    })
    // 退出
    $logout.on('click', function() {
        $.ajax({
            // 只用get的默认方式即可,也不用传输数据
            url: '/api/user/logout',
            success: function(result) {
                $userInfo.find('.colWarning').html(result.message);
                if(!result.code) {
                    // 退出成功
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                }
            }
        })
    })

})