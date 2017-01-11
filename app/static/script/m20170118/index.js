/**
 * Created by Administrator on 2017/1/11.
 */
define(function (require) {
    require('zepto.min');
    require('fastclick');
    //依赖

    var Vue = require('vue');
    var shareInit = require('share-init'),
        pageUrl = require('url-map'),
        base = require('base'),
        slotMachine = require('raffle-slotMachine'),
        hybridProtocol = require('native-calls');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var activityCode = '20170118',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        endTime = activityData.endDate,
        startTime = activityData.startDate;     //开始时间
    var isShow = sysTime > startTime;
    var shareCurPage = {
        title: '这个188元新手注册礼，我一定要分享给你！',
        desc: '注册30秒，奖励188元，只要想理财，福利你拿走！',
        url: base.switchUrl('m' + activityCode + '/index')
    };
    shareInit({
        isApp: base.isApp,
        dataUrl: "",
        imgUrl: shareImg,             //分享图片
        shareLink: shareCurPage.url,   //分享链接
        curLink: curPageUrl,          //本地链接
        title: shareCurPage.title,    //分享标题
        desc: shareCurPage.desc,      //分享文案
        type: ""
    });
    new Vue({
        el: 'body',
        data: {
            isTime:isShow,
            isLogin:!!userPhone,
            money:0
        },
        ready: function () {
            var _this = this;
        },
        methods: {
            gotologin:function(){
                base.gotoLogin();
            }
        }
    })
});