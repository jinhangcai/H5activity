define(function (require) {
//--------------------------------------------------【require】
    require('zepto.min');
    require('fastclick');
    //引入依赖
    var base = require('base');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
//--------------------------------------------------【变量】
    var goback = $('.goback');

    goback.on('click', function(){
        if(base.isApp){
            base.goHistory()
        }else{
            location.href = base.switchUrl('m20160205/main');
        }
    });
});