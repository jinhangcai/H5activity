/**
 * Created by Administrator on 2016/10/28.
 */
define(function (require) {
    require('zepto.min');
    require('fastclick');
    var hrefParameter = require('href-parameter');
    var Format = require('date-format');
    var shareInit = require('share-init'),
        hybridProtocol = require('native-calls'),
        pageUrl = require('url-map'),
        base = require('base'),
        Vue = require('vue');
    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
    var activityCode = '20161111',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime;      //系统时间
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '双11多存一点，少花一点，钱庄这次优惠玩大了！',
        desc: '老朋友，钱庄11.11理财盛宴来袭，啥也别说，赶快来抢！',
        url: base.switchUrl('m' + activityCode + '/timetorob')
    };
    var times = 0;
    var timeFormat = Format;
    var sharebrand = '';
    function date(setFullYear,setMonth,setDate,setHours,setMinutes,setSeconds,setMilliseconds){
        var date = new Date();
        date.setMilliseconds(setMilliseconds);
        date.setMinutes(setMinutes);
        date.setSeconds(setSeconds);
        date.setHours(setHours);
        date.setDate(setDate);
        date.setMonth(setMonth);
        date.setFullYear(setFullYear);
        return date.getTime()
    }
    var data07 =    date(2016,10,7,11,11,0,0);                  //7号开始时间   2016/11/7/11/11/0/0
    var data07out = data07+43200000;                            //7号结束时间   2016/11/8/0/0/0/0
    var data08 =    data07out+43200000;                         //8号开始时间   2016/11/8/11/11/0/0
    var data08out = data08+43200000;                            //8号结束时间   2016/11/9/0/0/0/0
    var data09 =     data08out+43200000;                        //9号开始时间   2016/11/9/11/11/0/0
    var data09out =  data09+43200000;                           //9号结束时间   2016/11/10/0/0/0/0
    var data10 =     data09out+43200000;                        //10号开始时间  2016/11/10/11/11/0/0
    var data10out =  data10+ 43200000;
    var add=[[sysTime,data07],[data07out,data08],[data08out,data09],[data09out,data10]];
    function setTime(_this,data,sysTime){
        _this.activity = true;
        var d = new Date();
        var millisecond = d.getTime();      //返回1970至今的毫秒数
        var diff = sysTime-millisecond;     //计算差值
        var thisTime = millisecond+diff;    //增加差值
        var setinterval = setInterval(function(){
            times+=1000;
            if(data-(thisTime+times) >=0){
                var form = timeFormat.countdown(data-(thisTime+times),':');
                _this.form = form;
            }else{
                _this.loader();
                clearInterval(setinterval);
            }
        },1000);
    }
    function twoNum(num){
        return num >= 10 ? num : '0'+num
    }
    Vue.filter('date', function (value) {
        var dateObj = new Date(value),
            year = dateObj.getFullYear(),
            month = dateObj.getMonth() + 1,
            date = dateObj.getDate(),
            hours = twoNum(dateObj.getHours()),
            minutes = twoNum(dateObj.getMinutes()),
            seconds = twoNum(dateObj.getSeconds());
        return year+'.'+month+'.'+date+' '+hours+':'+minutes+':'+seconds;
    });
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,
            isLogin: !!userPhone,
            activity:true,          //还未抢红包
            down:true,              //是否显示倒计时
            form:'',                //倒计时
            howmoney:false,         //抢红包成功
            isActive:false,         //按钮背景颜色
            money:0,                // 抽到红包金额
            dayvie:false,           //活动是否结束
            nored:false,            //今日是否抢完
            poker:false,             //弹窗
            isshow:false,            //是否显示立即抢按钮
            showred:false,
            degree:false,
            off:true,
            showAwardMask:false,
            awardList:[],
            showcock:false,
            bomshowtops:false,
            isIOSApp: base.isApp && base.isIOS(),
            isApp:base.isApp,
            ofclick:false
        },
        ready: function () {
            var _this = this;
            _this.pageLoading = false;
            _this.userShareBrand();
            _this.shareInt();
            for(var i=0;i<add.length;i++){
                //倒计时范围内 && 时间活动还未结束
                if(sysTime >= add[i][0] && sysTime <= add[i][1] && sysTime <= data10out){
                    _this.activity = true;
                    _this.showred = true;
                    _this.down = true;
                    setTime(_this,add[i][1],sysTime);
                    return;
                }else{
                    _this.activity = true;
                    _this.down = false;
                    _this.showred = true;
                    _this.isshow = true;
                    //活动结束
                    if(sysTime > data10out){
                        _this.dayvie = true;
                        _this.showred = false;
                        _this.isshow = false;
                        _this.nored = false;
                        return;
                    }
                }
            }
            _this.loader();
        },
        methods:{
            loader:function(){
                var _this = this;
                if(!_this.off || !_this.isLogin){
                    return;
                }
                $.ajax({
                    url: pageUrl.queryInitParamsOfLinkOne.url,
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : '')
                    },
                    xhrFields: {
                        withCredentials: true
                    },

                    dataType: "json",
                    beforeSend:function(){
                        _this.off = false;
                    },
                    complete:function(){
                        _this.off = true;
                    },
                    success: function (data) {
                        if (data.resultCode == 1) {
                           if(data.resultData.isTodayUserTimesOver){
                                //用户今日抢完
                               _this.activity = true;
                               _this.showred = true;
                               _this.down = false;
                               _this.nored = false;
                               _this.dayvie = false;
                               _this.degree = true;
                               _this.isshow = false;
                           }else{
                               _this.activity = true;
                               _this.showred = true;
                               _this.down = false;
                               _this.nored = false;
                               _this.dayvie = false;
                               _this.degree = false;
                               _this.isshow = true;
                           }
                           if(data.resultData.isTodayRedTimesOver){
                               //红包今日抢完
                               _this.activity = true;
                               _this.showred = true;
                               _this.down = false;
                               _this.nored = true;
                               _this.dayvie = false;
                               _this.degree = false;
                               _this.isshow = false;
                           }
                        }
                    }

                })
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
            usershare:function(){
                //主动分享
                var _this = this;
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
            gotoenter:function(){
                //登入
                base.gotoLogin();
            },
            openRed:function(){
                //抢红包
                var _this = this;
                if(_this.ofclick){
                    return;
                }
                $.ajax({
                    url: pageUrl.openRed.url,
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
                    beforeSend:function(){
                        _this.ofclick = true;
                    },
                    complete:function(){
                        _this.ofclick = false;
                    },
                    success: function (data) {
                        if(data.resultCode == 1){
                            _this.money = data.resultData.redAmount;
                            _this.activity = false;
                            if(!data.resultData.isTodayShared){
                                //今日未分享过
                                _this.showcock = true;
                                _this.bomshowtops = false;
                            }
                            else{
                                _this.showcock = false;
                                _this.bomshowtops = true;
                            }
                        }
                        if(data.resultCode == 0){
                            if(data.errorCode == 'TODAY_CHANCE_IS_OVER'){
                                //今日次数已用完
                                _this.activity = true;
                                _this.down = false;
                                _this.nored = false;
                                _this.dayvie = false;
                                _this.degree = true;
                                _this.isshow = false;
                            }
                            if(data.errorCode == 'TODAY_RED_IS_OVER'){
                                //今日红包已领完
                                _this.activity = true;
                                _this.down = false;
                                _this.nored = true;
                                _this.dayvie = false;
                                _this.isshow = false;
                                _this.degree = false;
                            }
                        }
                    }

                });
            },
            again:function(){
                //再来一次
                var _this = this;
                _this.loader();
            },
            nopoker:function(){
                var _this = this;
                _this.poker = false;
            },
            hideAwardMask:function(){
               var _this = this;
                _this.showAwardMask = false;
            },
            showLotteryList: function(){
                var _this = this;
                if(!_this.isLogin){
                    _this.gotoenter();
                    return;
                }
                var that = this;
                $.ajax({
                    url: pageUrl.myRed.url,
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'click_get_redpacket'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    async: false,
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.awardList = data.resultData.list;
                            that.showAwardMask = true;
                        }else{
                            console.log(data.resultMsg)
                        }
                    }
                });
            },
            gotohome:function(){
                base.checkAppEvent(base.switchUrl('m' + activityCode + '/index'), '双11理财盛宴 多重惊喜嗨不停')
            }
        }
    })
});
