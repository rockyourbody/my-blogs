$(function() {
    var $loginBox = $('#loginBox');
    var $registerBox = $('#registerBox');

    $loginBox.find('a.colMint').on('click', function() {
        $registerBox.show();
        $loginBox.hide();
    })

    $registerBox.find('a.colMint').on('click', function() {
        $loginBox.show();
        $registerBox.hide();
    })
})