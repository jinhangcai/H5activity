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


    var activityCode = '20160818',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate;     //开始时间

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '别怪我没提醒你，这里要送Iphone7大礼包啦！',
        desc: '钱庄老板说了，八月不能让我们穷的没钱买冰棍！',
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
            userTotal: 0,
            teamTotal: 0,
            isIOSApp: base.isApp && base.isIOS()
        },
        ready: function () {
            var that = this;

            if(this.isLogin && this.isStart){
                // 获取累计投资额
                $.ajax({
                    url: pageUrl.queryAdventureData.url,
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
                            that.userTotal = data.resultData.personalAll;
                            that.teamTotal = data.resultData.teamAll;
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