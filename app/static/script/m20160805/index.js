define(function (require) {
    require('zepto.min');
    require('fastclick');

    var pageUrl = require('url-map');

    //依赖
    var shareInit = require('share-init'),
        base = require('base'),
        Vue = require('vue'),
        cookie = require('cookie'),
        hybridProtocol = require('native-calls');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);


    var activityCode = '20160805',
        activityData = base.activityData(activityCode),
        sysTime = activityData.systemTime,      //系统时间
        startDate = activityData.startDate,     //开始时间
        endDate = activityData.endDate;         //结束时间
//------------------------------------------------------------[页面逻辑]
    new Vue({
        el: 'body',
        data: {
            isPageLoading: true,    // 页面加载遮罩
            isShareMask: false,     // 分享遮罩是否显示
            isOpened: false,        // 红包是否打开
            phone: '',              // 用户手机号
            amount: 0,              // 红包金额
            num: 0,                 // 已助力人数
            popTips: ''             // 错误提示弹框
        },
        computed: {
            isStart: function () {
                return sysTime > startDate;
            },
            isEnd: function () {
                return sysTime > endDate;
            }
        },
        ready: function () {
            var _this = this;

            // 获得已助力人数
            $.ajax({
                url: pageUrl.countOlympicPerson.url,
                type: "get",
                data: {
                    activityCode: activityCode
                },
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                success: function (data) {

                    // 服务端错误提示
                    if (data.resultCode !== 1) {
                        _this.popTips = data.resultMsg;

                        setTimeout(function () {
                            _this.popTips = '';
                        }, 1000);

                        return false;
                    }

                    _this.num = data.resultData.num;
                    _this.isPageLoading = false;
                }
            });

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
            linkInvest: function () {
                if (base.isApp) {
                    hybridProtocol({
                        tagName: 'openNativePage',
                        data: {
                            type: 'productList',
                            url: window.location.href
                        }
                    });
                } else {
                    window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.qz.qian&ckey=CK1304356609522';
                }
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
                            title: shareCurPage.title,    //分享标题
                            desc: shareCurPage.desc,      //分享文案
                            type: ""
                        },
                        success: function (data) {
                        },
                        error: function (data) {
                        }
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
                if (!_this.isStart) {
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

                        // 服务端错误提示
                        if (data.resultCode !== 1) {
                            _this.popTips = data.resultMsg;

                            setTimeout(function () {
                                _this.popTips = '';
                            }, 1000);

                            return false;
                        }

                        // 提示已领取
                        if (data.resultData.isReceived) {
                            _this.popTips = '你已领过这个红包了';

                            setTimeout(function () {
                                _this.popTips = '';
                            }, 1000);
                        } else {
                            _this.num = _this.num + 1;
                        }

                        _this.amount = data.resultData.money;

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
        title: '别说话，钱庄为助力奥运出大血了，来搜刮点福利吧！',
        desc: '嗨，我为中国奥运团加油了，还有福利领哦！',
        url: base.switchUrl('m' + activityCode + '/index')
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