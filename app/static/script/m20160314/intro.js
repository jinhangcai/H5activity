define(function (require) {
//--------------------------------------------------【require】
    require('zepto.min');
    //依赖
    var base = require('base'),
        shareInit = require('share-init');

//--------------------------------------------------【变量】
    var activityCode='20160314';
    var share = {
        url: base.switchUrl('m'+activityCode+'/index'),
        title: '钱庄邀您免费体验超炫F16战斗机飞行！',
        desc: '最美季节就要玩最刺激的！钱庄日百万积分、F16战斗机1:1飞行带你一起直冲云霄！'
    },
        curPageUrl = window.location.href,
        shareImg = location.protocol + '//' + location.host + $('#sharePic').val();

//--------------------------------------------------【event】

    shareInit({
        isApp: base.isApp,
        dataUrl: "",
        imgUrl: shareImg,
        shareLink: share.url,
        curLink: curPageUrl,
        title: share.title,
        desc: share.desc,
        type: ""
    });
});
