/**
 * Created by Administrator on 2016/11/15.
 */
define(function (require) {
    require('zepto.min');
    require('fastclick');
    var hrefParameter = require('href-parameter');
    var shareInit = require('share-init'),
        hybridProtocol = require('native-calls'),
        pageUrl = require('url-map'),
        base = require('base'),
        Vue = require('vue');
    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
    var activityCode = '20161118',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate,      //活动开始时间
        EndTime = activityData.endDate;          //活动结束时间
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var sharebrand = '';
    var shareCurPage = {
        title: '11.18钱庄日火爆来袭，惊喜好礼只限一天，错过再等一月！',
        desc: '11月还攒不下钱？那是因为你错过了钱庄日的特惠礼！',
        url: base.switchUrl('m' + activityCode + '/index')
    };
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,
            isLogin: !!userPhone,
            start:sysTime > startTime,
            money:0,
            poker:false,
            showAlertMask:false,
            title:'',
            draw:true,
            noShared:false,
            hasReceived:false,
            noReceived:false,
            redboms:'?',
            quick:'?',
            isShow:true
        },
        ready: function () {
            var _this = this;
            this.pageLoading = false;
            _this.userShareBrand();
            _this.shareInt();
            _this.load();
            if(_this.isLogin && _this.start){
                //登录且活动开始
                _this.leader();
            }
            if(_this.isLogin){
                _this.isShow = false;
            }
        },
        methods: {
            leader:function(){
                //投资金额
                var _this = this;
                $.ajax({
                    url: pageUrl.queryDataOf20161118.url,
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode:activityCode
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode == 1){
                            _this.money = data.resultData.personalAll;
                        }
                    }
                })
            },
            load:function(){
                //初始化
                var _this = this;
                $.ajax({
                    url: pageUrl.queryInitParamsOf20161118.url,
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : '')
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode == 1){
                            //红包 redFlag:true已领取  false未领取
                            if(data.resultData.redAmount > 0){
                                _this.redboms = data.resultData.redAmount;
                                _this.draw = false
                            }
                            //加息 couponFlag：noShared:未成功分享  hasReceived:已领取  noReceived：未领取
                            if(data.resultData.couponAmount == -99){
                                _this.noShared = true;
                            }
                            if(data.resultData.couponAmount > 0 ){
                                _this.quick = data.resultData.couponAmount;
                                _this.hasReceived = true;
                            }
                            if(data.resultData.couponAmount == 0){
                                _this.noReceived = true;
                            }
                        }

                    }
                })
            },

            gotoLogin:function(){
                //登录
                base.gotoLogin();
            },
            invest:function(){
                //去投资
                base.gotoProductList();
            },
            redbom:function(){
                //领取红包
                var _this = this;
                if(!_this.isLogin){
                    _this.gotoLogin();
                    return;
                }
                if(sysTime < startTime){
                    _this.showAlertMask = true;
                    _this.title = '11月18日-20日才开始哦~';
                    return;
                }
                if(sysTime > EndTime){
                    _this.showAlertMask = true;
                    _this.title = '活动已经结束了哦~';
                    return;
                }
                $.ajax({
                    url: pageUrl.getGiftOf20161118.url,
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode:activityCode,
                        giftType:'red'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    success: function (data) {
                        if (data.resultCode == 1) {
                            _this.redboms = data.resultData.redAmount;
                            _this.draw = false;
                        }
                    }
                })

            },
            shareget2:function(){
                var _this = this;
                if(!_this.isLogin){
                    _this.gotoLogin();
                }
            },
            shareget1:function(){
                var _this = this;
                if(!_this.isLogin){
                    _this.gotoLogin();
                    return;
                }
                if(_this.noReceived){
                    //未领取加息券
                    if(sysTime < startTime){
                        _this.showAlertMask = true;
                        _this.title = '11月18日-20日才开始哦~';
                        return;
                    }
                    if(sysTime > EndTime){
                        _this.showAlertMask = true;
                        _this.title = '活动已经结束了哦~';
                        return;
                    }
                    $.ajax({
                        url: pageUrl.getGiftOf20161118.url,
                        type: "post",
                        data: {
                            oauthToken: base.token,
                            native_view: (base.isApp ? 'app' : ''),
                            activityCode:activityCode,
                            giftType:'coupon'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        dataType: "json",
                        success: function (data) {
                            if (data.resultCode == 1) {
                                _this.quick = data.resultData.couponAmount;
                                _this.hasReceived =true;
                                _this.noShared = false;
                                _this.noReceived = false;
                                _this.isShow = false;
                            }
                        }
                    })
                }
            },
            shareget:function(){
                //分享后领取
                var _this = this;
                if(!_this.isLogin){
                    _this.gotoLogin();
                    return;
                }
                if(_this.noShared){
                    //未分享
                    if(sysTime < startTime){
                        _this.showAlertMask = true;
                        _this.title = '11月18日-20日才开始哦~';
                        return;
                    }
                    if(sysTime > EndTime){
                        _this.showAlertMask = true;
                        _this.title = '活动已经结束了哦~';
                        return;
                    }
                }
                if(base.isApp){
                    hybridProtocol({
                        tagName: 'getShare',
                        data: {
                            dataUrl: "",
                            imgUrl: shareImg,
                            link: base.urlQuery(shareCurPage.url, 'shareBrand='+sharebrand),
                            title: shareCurPage.title,
                            desc: shareCurPage.desc,
                            type: ""
                        },
                        success: function (data) {},
                        error: function (data) {}
                    });
                }else{
                    _this.poker = true;
                }
            },
            userShareBrand:function(){
                //增加分享次数
                var userShareBrand = hrefParameter.get('shareBrand');
                if(userShareBrand){
                    $.ajax({
                        url: pageUrl.clickShareLink.url,
                        type: "post",
                        data: {
                            shareBrand: userShareBrand,
                            activityCode: activityCode,
                            linkCode:'click_get_redpacket'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        dataType: "json",
                        success: function (data) {}
                    });
                }
            },
            shareInt:function(){
                //初始化分享
                var _this = this;
                if(_this.isLogin){
                    $.ajax({
                        url: pageUrl.createShareCode.url,
                        type: "post",
                        data: {
                            oauthToken: base.token,
                            native_view: (base.isApp ? 'app' : ''),
                            activityCode: activityCode,
                            linkCode:'click_get_redpacket'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        dataType: "json",
                        success: function (data) {
                            if (data.resultCode == 1) {
                                sharebrand = data.resultData.shareBrand;
                                _this.shareEvent();
                            }
                        }
                    });
                }else{
                    _this.shareEvent();
                }
            },
            shareEvent:function(){
                shareInit({
                    isApp: base.isApp,
                    dataUrl: "",
                    imgUrl: shareImg,
                    shareLink: base.urlQuery(shareCurPage.url,"shareBrand="+sharebrand),
                    curLink: curPageUrl,
                    title: shareCurPage.title,
                    desc: shareCurPage.desc,
                    type: ""
                });
            },
            nopoker:function(){
                //关闭分享遮罩
                var _this = this;
                _this.poker = false;
            },
            hideAlert:function(){
                //关闭时间提示
                var _this = this;
                _this.showAlertMask = false;
            }
        }
    });
});