define(function (require) {
//--------------------------------------------------【require】
    require('zepto.min');
    require('fastclick');
    //引入依赖
    var base = require('base'),
        shareInit = require('share-init');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
//--------------------------------------------------【变量】
    var sysTime,startTime,endTime,activityData,
        activityCode = '20160205';

    var entryBtn = $('.entry-btn'),
        ruleBtn = $('.rule-btn'),
        dialog = $('.ui-dialog-wrap'),
        dialogCont = dialog.find('.ui-dialog-content'),
        dialogClose = dialog.find('.ui-dialog-close');

    // 登录状态
    var isLogin = base.checkLogin();

    activityData = base.activityData(activityCode);
    sysTime = activityData.systemTime;
    startTime = activityData.startDate;
    endTime = activityData.endDate;

//--------------------------------------------------【规则弹框】
    // 弹框说明内容设置上限
    var winH = $(window).height();
    dialogCont.css({
        'max-height': winH * 0.8
    });
    // 弹框说明打开关闭
    var hideCls = 'ui-dialog-hide';
    ruleBtn.on('click', function(){
        dialog.removeClass(hideCls)
    });
    dialogClose.on('click', function(){
        dialog.addClass(hideCls)
    });

    // 未开始提示
    var alertDialog = $('#alertDialog'),
        aDBtn = alertDialog.find('.ui-dialog-btn'),
        aDClose = alertDialog.find('.ui-dialog-close');
    aDBtn.on('click', function(){
        alertDialog.addClass(hideCls)
    });
    aDClose.on('click', function(){
        alertDialog.addClass(hideCls)
    });
//--------------------------------------------------【进入主场景】
    $('#loadpage').css('display', 'none'); // 加载动画关闭

    entryBtn.on('click', function(){
        if(sysTime < startTime){
            alertDialog.removeClass(hideCls);
            return;
        }
        if(!isLogin){
            base.gotoLogin();
            return;
        }
        base.checkAppEvent(base.switchUrl('m20160205/main'),'金猴献桃闹新春 钱庄送礼过大年')
    });

    var share = {
            url: base.switchUrl('m20160205/entry'),
            title: '我家养了一只猴子，每天给我偷来十几个桃子，超给力的！',
            desc: '养猴摘桃，最多可换500元压岁钱，何乐而不为？桃子越多，福利越大！'
        },
        shareImg = location.protocol + '//' + location.host + $('#sharePic').val();
    // 页面分享初始化
    shareInit({
        isApp: base.isApp,
        dataUrl: "",
        imgUrl: shareImg,
        shareLink: share.url,
        curLink: window.location.href,
        title: share.title,
        desc: share.desc,
        type: ""
    });
});