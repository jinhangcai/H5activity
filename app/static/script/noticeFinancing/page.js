define(function (require) {
//--------------------------------------------------【require】
    require('zepto.min');

    //引入依赖
    var base = require('base');
    var shareInit = require('share-init');

//--------------------------------------------------【基础数据以及活动数据】
    var shareCurPage = {
        imgUrl: location.protocol + '//' + location.host + $('#shareImg').val(),
        title: '祝贺钱庄网获威亚兆业A轮千万元融资！',
        desc: '感谢钱庄网用户一直以来对钱庄的支持和信任，超级福利来袭不要错过哦！',
        url: base.switchUrl('noticeFinancing/index')
    };

    shareInit({
        isApp: base.isApp,
        dataUrl: "",
        imgUrl: shareCurPage.imgUrl,
        shareLink: shareCurPage.url,
        curLink: window.location.href,
        title: shareCurPage.title,
        desc: shareCurPage.desc,
        type: ""
    });
});