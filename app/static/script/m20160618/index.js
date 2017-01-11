define(function (require) {
    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
        base = require('base'),
        Vue = require('vue'),
        Dialog = require('activity-dialog');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);


    var activityCode = '20160618',
        isLogin = base.checkLogin(),        // 是否登录
        activityData = base.activityData(activityCode),
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate;     //开始时间

    var dialogAlert = new Dialog({
        btns: [{
            cls: 'btn',
            text: '我知道了'
        }]
    });

//------------------------------------------------------------[页面逻辑]
    new Vue({
        el: 'body',
        data: {
            pageLoading: true
        },
        computed: {
            isLogin: function () {
                return !!activityData.phone;
            }
        },
        ready: function () {
            this.pageLoading = false;
        },
        methods: {
            linkPrelude: function () {
                base.checkAppEvent(base.switchUrl('m' + activityCode + '/prelude'), '周年前奏礼');
            },
            linkHappyDay: function () {
                base.checkAppEvent(base.switchUrl('m' + activityCode + '/happyDay'), '周年天天乐');
            },
            linkCountdown: function () {
                base.checkAppEvent(base.switchUrl('m' + activityCode + '/countdown'), '周年倒计时');
            },
            linkAnniversary: function () {
                base.checkAppEvent(base.switchUrl('m' + activityCode + '/rock'), '周年嗨翻天');
            },
            notStart: function () {
                dialogAlert.setcontent('别着急，先看看其他活动吧').open();
            }
        }
    });

//------------------------------------------------------------[分享]
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '快来，钱庄2周年庆典，惊喜福利足以撩拨你的心扉了！',
        desc: '今年生日不止嗨一次，来钱庄陪小二一起收生日好礼！',
        url: base.switchUrl('m' + activityCode + '/index')
    };

    function shareEvent() {
        shareInit({
            isApp: base.isApp,
            dataUrl: "",
            imgUrl: shareImg,
            shareLink:shareCurPage.url,
            curLink: curPageUrl,
            title: shareCurPage.title,
            desc: shareCurPage.desc,
            type: ""
        });
    }

    shareEvent();
});