define(function (require) {
    require('zepto.min');
    require('fastclick');

    var pageUrl = require('url-map');

    //依赖
    var shareInit = require('share-init'),
        base = require('base'),
        Vue = require('vue'),
        hybridProtocol = require('native-calls');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);


    var activityCode = '20160618',
        activityData = base.activityData(activityCode),
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate;     //开始时间

//------------------------------------------------------------[页面逻辑]
    Vue.filter('days', function (value) {
        return new Date(Number(value)).getDate() + '日';
    });

    new Vue({
        el: 'body',
        data: {
            rulePop: false,
            receivePop: false,
            pageLoading: true,
            shareMask: false,
            tenderHistory: [],
            attendanceStartTime: startTime + 86400000 * 5,   // 签到开始时间,真实环境数据为`2016/06/23`
            attendanceDays: 7,
            attendanceState: []
        },
        computed: {
            isLogin: function () {
                return !!activityData.phone;
            },
            isStart: function () {
                return sysTime > startTime + 86400000 * 5;
            },
            isEnd: function () {
                return sysTime > startTime + 86400000 * 12
            },
            attendanceTable: function () {

                /*
                 * 生成一个map表,如下:
                 * Object {1465056000000: false, 1465142400000: true, 1465228800000: true, 1465315200000: false, 1465401600000: false…}
                 * */

                var obj = {};

                for (var i = 0; i < this.attendanceDays; i++) {
                    obj[this.attendanceStartTime + 86400000 * i] = $.inArray(this.attendanceStartTime + 86400000 * i, this.attendanceState) > -1;
                }

                return obj;
            }
        },
        ready: function () {
            var _this = this;
            this.pageLoading = false;

            if (this.isLogin) {

                $.ajax({
                    url: pageUrl.tenderHistory.url,
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
                        for (var i = 0, l = data.resultData.length; i < l; i++) {
                            _this.attendanceState.push(data.resultData[i]);
                        }
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
            linkInvest: function () {
                base.gotoProductList();
            },
            linkLogin: function () {
                base.gotoLogin();
            },
            showRulePop: function () {
                this.rulePop = true;
            },
            hideRulePop: function () {
                this.rulePop = false;
            },
            showShareMask: function () {

                shareCurPage = {
                    title: '疯狂十元的赚钱玩法，动动手指马上分享，成就百万富翁从此开始！',
                    desc: '小二偷偷告诉你，好多小伙伴的运气超棒哦！',
                    url: base.switchUrl('m' + activityCode + '/share')
                };

                shareEvent();

                // 在app下直接调出分享控件
                if (base.isApp) {
                    hybridProtocol({
                        tagName: 'getShare',
                        data: {
                            dataUrl: "",
                            imgUrl: shareImg,             //分享图片
                            link: shareCurPage.url,       //分享链接
                            title:shareCurPage.title,    //分享标题
                            desc: shareCurPage.desc,      //分享文案
                            type: ""
                        },
                        success: function (data) {},
                        error: function (data) {}
                    });
                    return false;
                }

                this.shareMask = true;
            },
            hideShareMask: function () {
                this.shareMask = false;
            }
        }
    });

//------------------------------------------------------------[分享]
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '快来，钱庄2周年庆典，惊喜福利足以撩拨你的心扉了！',
        desc: '今年生日不止嗨一次，来钱庄陪小二一起收生日好礼！',
        url: base.switchUrl('m' + activityCode + '/countdown')
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