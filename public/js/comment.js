$(function() {
    // 每页显示条数
    var prepage = 2;
    // 当前页数
    var page = 1;
    // 总页数
    var pages = 0;

    var comments = [];

    $('#submit').on('click', function() {
        $.ajax({
            type: 'POST',
            url: '/api/comment/post',
            data: {
                contentid: $('#contentId').val(),
                content: $('#textarea').val()
            },
            success: function(responseData) {
                $('#textarea').val('');
                // 把当前获取的内容赋值给comments，直接调用当前渲染
                comments = responseData.data.comments.reverse();
                renderComment();
                window.location.reload();
            } 
        })
    });

    // 每次页面重载时获取评论
    $.ajax({
        type: 'GET',
        url: '/api/comment',
        data: {
            contentid: $('#contentId').val()
        },
        success: function(responseData) {
            comments = responseData.data.reverse();
            renderComment();
        } 
    });

    // 通过事件委托
    $('.pager').delegate('a', 'click', function() {
        if($(this).parent().hasClass('previous')) {
            page --;
        } else {
            page ++;
        }
        // 调用方法，再渲染，不可能再发送ajax请求，因此将comment设置成全局
        renderComment();
    });

    function renderComment() {
        $('#messageCount').html(comments.length);
        // 分页设置
        pages = Math.max(Math.ceil(comments.length / prepage), 1);
        var start = Math.max(0, (page - 1) * prepage);
        var end = Math.min(start + prepage, comments.length);

        var $lis = $('.pager li');
        $lis.eq(1).html(page + '/' + pages);

        if(page <= 1) {
            page = 1;
            $lis.eq(0).html('<span>没有上一页</span>');
        } else {
            $lis.eq(0).html('<a href="javascript:;">上一页</a>');
        }
        if(page >= pages) {
            page = pages;
            $lis.eq(2).html('<span>没有下一页</span>');
        } else {
            $lis.eq(2).html('<a href="javascript:;">下一页</a>');
        }

        if(comments.length == 0) {
            $('.messageList').html('<div class="messageBox">还没有评论</div>');
        } else {
            var html = '';
            for(var i = start; i < end; i++) {
                html += 
                `<div class="newReview">
                <span class="fl">${comments[i].username}</span>
                <span class="fr">${formatDate(comments[i].postTime)}</span>
                </div>
                <div class="contentReview">${comments[i].content}</div>
                </div>`
            }
            $('.messageList').html(html);
        }
    };

    // 格式化时间
    function formatDate(date) {
        var resetDate = new Date(date);
        return resetDate.getFullYear() + '年' + (resetDate.getMonth() + 1) + '月' + resetDate.getDate() + '日' + resetDate.getHours() + ':' + resetDate.getMinutes() + ':' + resetDate.getSeconds(); 
    };

})
