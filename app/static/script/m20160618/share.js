define(function (require) {
    require('zepto.min');
    require('fastclick');

    var pageUrl = require('url-map');

    //依赖
    var shareInit = require('share-init'),
        base = require('base'),
        Vue = require('vue'),
        cookie = require('cookie');

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
            isPageLoading: true,
            isShareMask: false,
            isOpened: false,
            phone: '',
            amount: 0,
            popTips: ''
        },
        computed: {
            isStart: function () {
                return sysTime > startTime + 86400000 * 5;
            },
            isEnd: function () {
                return sysTime > startTime + 86400000 * 12;
            }
        },
        ready: function () {
            var _this = this;
            _this.isPageLoading = false;

            //if (_this.isLogin) {
            //
            //    //获取cookie,判断是否已经领取
            //    var openedPhone = cookie.get('openedPhone');
            //
            //    if (cookie.get('openedPhone')) {
            //        _this.isOpened = true;
            //        _this.phone = openedPhone;
            //    }
            //}
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
            linkInvest: function () {
                base.gotoProductList();
            },
            showShareMask: function () {

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

                this.isShareMask = true;
            },
            hideShareMask: function () {
                this.isShareMask = false;
            },
            receive: function () {
                var _this = this;

                //校验手机号
                var reg = /^((13[0-9]{9})|(14[0-9]{9})|(15[0-35-9][0-9]{8})|(17[0-9]{9})|(18[0-9]{9}))$/ig;
                if (!reg.test(_this.phone)) {
                    _this.popTips = '请输入正确的手机号';

                    setTimeout(function () {
                        _this.popTips = '';
                    }, 1000);
                    return false;
                }

                //活动未开始阻止请求
                if(!_this.isStart){
                    _this.popTips = '不在活动期间！';

                    setTimeout(function () {
                        _this.popTips = '';
                    }, 1000);
                    return false;
                }

                //领取的红包
                $.ajax({
                    url: pageUrl.clickGetRedpacket.url,
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        phone: _this.phone
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    success: function (data) {

                        //校验手机格式/是否领取
                        if (data.resultCode !== 1) {
                            _this.popTips = data.resultMsg;

                            setTimeout(function () {
                                _this.popTips = '';
                            }, 1000);

                            return false;
                        }

                        _this.amount = data.resultData;

                        // 改变红包成打开状态
                        _this.isOpened = true;

                        //// 记录已打开状态
                        //cookie.set('openedPhone', _this.phone);
                    }
                });
            }
        }
    });

//------------------------------------------------------------[分享]
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '疯狂十元的赚钱玩法，动动手指马上分享，成就百万富翁从此开始！',
        desc: '小二偷偷告诉你，好多小伙伴的运气超棒哦！',
        url: base.switchUrl('m' + activityCode + '/share')
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