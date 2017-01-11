define(function (require) {
    require('zepto.min');
    require('fastclick');

    var pageUrl = require('url-map');

    //依赖
    var shareInit = require('share-init'),
        base = require('base'),
        Vue = require('vue');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);


    var activityCode = '20160618',
        activityData = base.activityData(activityCode),
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate;     //开始时间

//------------------------------------------------------------[页面逻辑]
    new Vue({
        el: 'body',
        data: {
            rulePop: false,
            pageLoading: true,
            investment: 0
        },
        computed: {
            isLogin: function () {
                return !!activityData.phone;
            },
            isStart: function () {
                return sysTime > startTime;
            }
        },
        ready: function () {
            var _this = this;
            this.pageLoading = false;

            if (this.isLogin) {
                $.ajax({
                    url: pageUrl.totalTender.url,
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    success: function (data) {
                        _this.investment = data.resultData;
                    }
                });
            }
        },
        methods: {
            linkHome: function () {
                if (!base.isApp) {
                    base.checkAppEvent(base.switchUrl('m' + activityCode + '/index'), '主会场')
                } else {
                    base.goHistory();
                }
            },
            linkLogin: function () {
                base.gotoLogin();
            },
            linkBbs: function () {
                base.checkAppEvent('https://bbs.qian360.com/posts/list/2610.page#13358', '');
            },
            showRulePop: function () {
                this.rulePop = true;
            },
            hideRulePop: function () {
                this.rulePop = false;
            }
        }
    });

//------------------------------------------------------------[分享]
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '快来，钱庄2周年庆典，惊喜福利足以撩拨你的心扉了！',
        desc: '今年生日不止嗨一次，来钱庄陪小二一起收生日好礼！',
        url: base.switchUrl('m' + activityCode + '/prelude')
    };

    function shareEvent() {
        shareInit({
            isApp: base.isApp,
            dataUrl: "",
            imgUrl: shareImg,
            shareLink: shareCurPage.url,
            curLink: curPageUrl,
            title: shareCurPage.title,
            desc: shareCurPage.desc,
            type: ""
        });
    }

    shareEvent();
});