/**
 * Created by Administrator on 2016/12/21.
 */
define(function (require) {
    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
        pageUrl = require('url-map'),
        base = require('base'),
        Vue = require('vue');
    var hrefParameter = require('href-parameter');
    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);


    var activityCode = '20161224',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        endTime = activityData.endDate,         //结束时间
        startTime = activityData.startDate;     //开始时间

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '快来！每年双蛋都有一群钱庄人在抢豪礼，场面太壮观！',
        desc: '至臻豪礼驾到！钱庄送大波惊喜彩蛋啦！',
        url: base.switchUrl('m' + activityCode + '/index')
    };
    var combination = location.protocol + '//' + location.host + $('#combination').val(),
        combination1 = location.protocol + '//' + location.host + $('#combination1').val();
    var arr =[5,combination,10,8,5,10,5,8,combination1,5,5];
    var dates = [24,25,26,27,28,29,30,31,1,2,3];
    var Date1 = new Date(sysTime);
    var year = Date1.getFullYear();
    var getMonth = Date1.getMonth()+1;// 月
    var getDate =  Date1.getDate();//日
    console.log(year,sysTime,startTime,endTime,getMonth,getDate);
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,

            isLogin:!!userPhone,
            poker:false,            //分享弹窗
            mask:false,              //提示弹窗
            shop:true,
            datashare:true,
            vouchers:0.2,
            pop:true,
            money:5,
            sharebrand:'',
            isReceived:true,
            brought:true,
            bgImg:'',
            isday:true,
            voucherss:0
        },
        ready: function () {
            var _this = this;
            _this.pageLoading = false;
            _this.loader();
            _this.userShareBrand();
        },
        methods: {
            loader:function(){
                var _this = this;
                //#分享接口
                _this.shareEvent();
                if(sysTime > startTime && _this.isLogin){
                    $.ajax({
                        url: pageUrl.apiUrl.url + '/activity/share/createShareCode.html',
                        type: "post",
                        data: {
                            oauthToken: base.token,
                            native_view: (base.isApp ? 'app' : ''),
                            activityCode: activityCode,
                            linkCode: 'share'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        dataType: "json",
                        async: false,
                        success: function (data) {
                            _this.sharebrand = data.resultData.shareBrand;
                            _this.shareEvent();
                        }
                    })
                }

                if(_this.isLogin){
                    //分享彩蛋初始化接口（今日是否领取）
                    $.ajax({
                        url: pageUrl.apiUrl.url + '/activity/monthlyActivity/queryData.html',
                        type: "post",
                        data: {
                            oauthToken: base.token,
                            native_view: (base.isApp ? 'app' : ''),
                            activityCode: activityCode,
                            linkCode: 'share'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        dataType: "json",
                        async: false,
                        success: function (data) {
                            if(data.resultData.flag == 0){
                                //未领取
                                _this.datashare = true;
                            }else{
                                //已领取
                                _this.datashare = false;
                                _this.vouchers = data.resultData.flag;
                                var money =data.resultData.flag+0.1;
                                _this.voucherss = money.toFixed(1);
                            }
                        }
                    });
                    //#投资彩蛋初始化接口（今日是否领取）
                    $.ajax({
                        url: pageUrl.apiUrl.url + '/activity/monthlyActivity/queryData.html',
                        type: "post",
                        data: {
                            oauthToken: base.token,
                            native_view: (base.isApp ? 'app' : ''),
                            activityCode: activityCode,
                            linkCode: 'tender_rank'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        dataType: "json",
                        async: false,
                        success: function (data) {
                            if(data.resultData.isReceived){
                                //已领取
                                _this.isReceived = false;
                            }else{
                                //未领取
                                _this.isReceived = true;
                            }
                        }
                    });
                }
                if(year > 2016 && getMonth >= 1 && getDate >= 3 ){
                    _this.isday = false
                }

            },
            shareone: function(){// 在app下直接调出分享控件
                var _this = this;
                if(!_this.isLogin){
                    base.gotoLogin();
                    return;
                }
                if(sysTime < startTime){
                    //活动未开始
                    _this.mask = true;
                    _this.title = '12月24日才开始哦~';
                    return;
                }
                if(sysTime > endTime){
                    //活动已经结束
                    _this.mask = true;
                    _this.title = '活动结束了哦~';
                    return;
                }

                if(base.isApp){
                    base.hybridProtocol({
                        tagName: 'getShare',
                        data: {
                            dataUrl: "",
                            imgUrl: shareImg,
                            link: base.urlQuery(shareCurPage.url, 'shareBrand='+_this.sharebrand),
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
            shareEvent:function(){
                var _this = this;
                shareInit({
                    isApp: base.isApp,
                    dataUrl: "",
                    imgUrl: shareImg,
                    shareLink: base.urlQuery(shareCurPage.url,"shareBrand="+_this.sharebrand),
                    curLink: curPageUrl,
                    title: shareCurPage.title,
                    desc: shareCurPage.desc,
                    type: ""
                });
            },
            userShareBrand:function(){
                //#点击分享链接发送加息券接口
                var userShareBrand = hrefParameter.get('shareBrand');
                if(userShareBrand){
                    $.ajax({
                        url: pageUrl.apiUrl.url+'/activity/share/clickShareLink.html',
                        type: "post",
                        data: {
                            activityCode: activityCode,
                            linkCode:'share',
                            shareBrand:userShareBrand
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        dataType: "json",
                        success: function (data) {}
                    });
                }
            },
            pokers:function(){
                //关闭弹窗
                this.poker = false
            },
            btn:function(){
                //关闭获奖 || 时间未到弹窗
                var _this = this;
                _this.mask = false;
            },
            gotoreceive:function(){
                //投资彩蛋 礼包放手领
                var _this = this;
                if(!_this.isLogin){
                    base.gotoLogin();
                    return;
                }
                if(sysTime < startTime){
                    //活动未开始
                    _this.mask = true;
                    _this.title = '12月24日才开始哦~';
                    return;
                }
                if(sysTime > endTime){
                    //活动已经结束
                    _this.mask = true;
                    _this.title = '活动结束了哦~';
                    return;
                }
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/share/receiveGift.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'tender_rank'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if(data.resultCode == 0){
                           if(data.errorCode == 'HAS_RECEIVED'){
                               //今日已领取
                               _this.isReceived = false;
                           }
                           if(data.errorCode == 'TENDER_NOT_ENOUGH'){
                               //投资不足2000
                               _this.title = '今天单笔投资满2000元才可领取';
                               _this.mask = true;
                               _this.pop = true;
                           }
                        }else{
                            if((year == 2016 && getMonth == 12) || (year == 2017 && getMonth == 1)) {
                                for (var i = 0; i < dates.length; i++) {
                                    if (dates[i] == getDate) {  //设置日期 == 系统日期
                                        if (dates[i] != 25 && dates[i] != 1) {
                                            _this.shop = true;
                                            var old = arr[i];
                                            _this.money = old;
                                        } else {
                                            _this.shop = false;
                                            var old = arr[i];
                                            _this.bgImg = old;
                                        }
                                        _this.title = '领取成功';
                                        _this.mask = true;
                                        _this.pop = false;
                                        _this.isReceived = false;
                                        return;
                                    }
                                }
                            }
                        }
                    }
                });
            },
            gotoeggs:function(){
                //跳转页面
                base.checkAppEvent(base.switchUrl('m20161224/birthday'), '圣诞彩蛋 红包放手赚')
            },
            gotoeggs1:function(){
                base.checkAppEvent(base.switchUrl('m20161224/NewDay'), '元旦彩蛋 年货放肆兑')
            },
            gotograb:function(){
                base.checkAppEvent('https://mall.qian360.com/grab.html?id=6', '一元夺宝');
            }
        }
    })
})