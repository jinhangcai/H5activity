define(function (require) {
    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
        pageUrl = require('url-map'),
        cookie = require('cookie'),
        base = require('base'),
        Vue = require('vue');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);


    var activityCode = '20161018',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate;     //开始时间

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '既然当不成土豪，就别再错过钱庄日的大礼！',
        desc: '今天你投了么，让你的钱在今天赚双倍的利息！',
        url: base.switchUrl('m' + activityCode + '/index')
    };

//------------------------------------------------------------[页面逻辑]
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,
            isLogin: !!userPhone,
            isStart: sysTime >= startTime,
            shareMask: false,
            all18: 0,
            all1820: 0,
            inviteNum: 0,
            isIOSApp: base.isApp && base.isIOS(),
            redPacketList: [
                {
                    limit: 2,
                    minNum: 6,
                    rule: '6≤财气值＜18',
                    btnStatus: 'default'
                },{
                    limit: 3,
                    minNum: 18,
                    rule: '18≤财气值＜38',
                    btnStatus: 'default'
                },{
                    limit: 5,
                    minNum: 38,
                    rule: '38≤财气值＜98',
                    btnStatus: 'default'
                },{
                    limit: 8,
                    minNum: 98,
                    rule: '98≤财气值＜388',
                    btnStatus: 'default'
                },{
                    limit: 18,
                    minNum: 388,
                    rule: '388≤财气值＜888',
                    btnStatus: 'default'
                },{
                    limit: 40,
                    minNum: 888,
                    rule: '财气值≥888',
                    btnStatus: 'default'
                }
            ]
        },
        ready: function () {
            var that = this;

            if(that.isStart && that.isLogin){
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/queryDataOf20161018.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    async: false,
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.all18 = data.resultData.all18;
                            that.all1820 = parseInt(data.resultData.all1820/500);
                            that.inviteNum = data.resultData.inviteNum;
                            var statusList = data.resultData.statusList;
                            for(var i= 0,l=statusList.length; i < l; i++){
                                if(statusList[i] == true){
                                    that.redPacketList[i].btnStatus = 'success';
                                }else{
                                    that.redPacketList[i].btnStatus = that.all1820 >= that.redPacketList[i].minNum ? 'primary' : 'default'
                                }
                            }
                        }else{
                            console.log(data.resultMsg)
                        }
                    }
                });
            }

            this.pageLoading = false;

        },
        methods: {
            hideShareMask: function(){
                this.shareMask = false;
            },
            showRulePop: function(){
                this.shareMask = true;
            },
            goLogin: function(){
                base.gotoLogin();
            },
            goWebPage: function(url){
                base.checkAppEvent(url, '')
            },
            receive: function(num, index){
                var that = this;
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/receiveRedOf20161018.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        type: num
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    async: false,
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.redPacketList[index].btnStatus = 'success';
                        }else{
                            alert(data.resultMsg)
                        }
                    }
                });
            }
        }
    });

//------------------------------------------------------------[分享]

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