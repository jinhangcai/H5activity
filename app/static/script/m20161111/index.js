define(function (require) {
    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
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
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate,     //开始时间
        endTime = activityData.endDate;         //结束时间

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '双11多存一点，少花一点，钱庄这次优惠玩大了！',
        desc: '老朋友，钱庄11.11理财盛宴来袭，啥也别说，赶快来抢！',
        url: base.switchUrl('m' + activityCode + '/index')
    };

//------------------------------------------------------------[页面逻辑]
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,
            shareMask: false,
            showAlertMask: false,
            isIOSApp: base.isApp && base.isIOS()
        },
        ready: function () {

            // 活动最后一天 定位到最后一个活动
            if(endTime - sysTime > 0 && endTime - sysTime < 86400000){
                var _top = $('.floor4').offset().top;
                $('.viewport').scrollTop(_top - 100);
            }

            this.pageLoading = false;
        },
        methods: {
            showRule: function(){
                this.shareMask = true;
            },
            hideRule: function(){
                this.shareMask = false;
            },
            showAlert: function(){
                this.showAlertMask = true;
            },
            hideAlert: function(){
                this.showAlertMask = false;
            },
            goTo: function(url, title, prevent){
                var _url = url;
                if(prevent === true){
                    this.showAlert();
                }else{
                    _url = url.indexOf('http')>-1 ? url : base.switchUrl('m' + activityCode + '/' + url);
                    base.checkAppEvent(_url, title)
                }
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