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


    var activityCode = '20160918',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.allLinkTime[0].startTime;     //开始时间

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '我去！再不出手iphone7等豪礼就抢光了！',
        desc: '简直逆天了，这次家庭理财节门槛低，人人有福利！',
        url: base.switchUrl('m' + activityCode + '/index')
    };

    function doubleDigit(num){
        return num < 10 ? '0'+num : num;
    }

    function maxDate(sysTime){
        var _now = new Date(sysTime),
            year = _now.getFullYear(),
            month = _now.getMonth()+ 1,
            date = _now.getDate(),
            hours = _now.getHours(),
            minutes = _now.getMinutes(),
            seconds = _now.getSeconds();

        if(sysTime > 1474214399000){
            return '2016-09-18 23:59:59'
        }

        month = doubleDigit(month);
        date = doubleDigit(date);
        hours = doubleDigit(hours);
        minutes = doubleDigit(minutes);
        seconds = doubleDigit(seconds);
        return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
    }



//------------------------------------------------------------[页面逻辑]
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,
            isLogin: !!userPhone,
            isStart: sysTime >= startTime,
            shareMask: false,
            personalAll: 0,
            qzAll: 0,
            date: maxDate(sysTime),
            isIOSApp: base.isApp && base.isIOS()
        },
        ready: function () {
            var that = this;

            if(this.isStart){
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/queryDataOf20160918.html',
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
                            that.qzAll = that.toThousands(data.resultData.qzAll);
                            if(that.isLogin){
                                that.personalAll = that.toThousands(data.resultData.personalAll);
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
            toThousands: function (num) {
                return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
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