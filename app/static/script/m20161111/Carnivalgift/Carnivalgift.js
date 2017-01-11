/**
 * Created by Administrator on 2016/11/1.
 */
define(function (require) {
    require('zepto.min');
    require('fastclick');
    var hrefParameter = require('href-parameter');
    var Format = require('date-format');
    var shareInit = require('share-init'),
        pageUrl = require('url-map'),
        base = require('base'),
        Vue = require('vue');
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
    var activityCode = '20161111',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        startDate = activityData.allLinkTime[3].startTime,   //开始时间
        endDate = activityData.allLinkTime[3].endTime;          //结束时间
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '双11多存一点，少花一点，钱庄这次优惠玩大了！',
        desc: '老朋友，钱庄11.11理财盛宴来袭，啥也别说，赶快来抢！',
        url: base.switchUrl('m' + activityCode + '/Carnivalgift')
    };
    function share(){
        shareInit({
            isApp: base.isApp,
            dataUrl: "",
            imgUrl: shareImg,             //分享图片
            shareLink:shareCurPage.url ,   //分享链接
            curLink: curPageUrl,          //本地链接
            title: shareCurPage.title,    //分享标题
            desc: shareCurPage.desc,      //分享文案
            type: ""
        });
    }
    share();
    new Vue({
        el: 'body',
        data: {
            pageLoading:true,
            notime:false,
            isLogin:!!userPhone,
            isApp:base.isApp,
            isIOSApp: base.isApp && base.isIOS(),
            money:0
        },
        ready:function(){
            var _this = this;
            _this.pageLoading = false;
            if(sysTime > startDate){
                _this.notime = true;
            }
            if(_this.isLogin && sysTime > startDate){
                _this.moneys();
            }
        },
        methods:{
            gotoLogin:function(){
                base.gotoLogin();
            },
            gotoout:function(){
                base.gotoProductList();
            },
            gotohome:function(){
                base.checkAppEvent(base.switchUrl('m' + activityCode + '/index'), '双11理财盛宴 多重惊喜嗨不停')
            },
            moneys:function(){
                var _this = this;
                $.ajax({
                    url: pageUrl.queryDataOfLink4.url,
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'qian360_tender_total'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode ==1){
                            _this.money = data.resultData.personalAll;
                        }
                    }
                })
            }
        }
    })
});