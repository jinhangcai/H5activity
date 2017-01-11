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

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);


    var activityCode = '20161224',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        endTime = activityData.endDate,         //结束时间
        startTime = activityData.allLinkTime[2].startTime;     //开始时间

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '快来！每年双蛋都有一群钱庄人在抢豪礼，场面太壮观！',
        desc: '至臻豪礼驾到！钱庄送大波惊喜彩蛋啦！',
        url: base.switchUrl('m' + activityCode + '/index')
    };
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,
            isLogin:!!userPhone,
            money:0,
            isTime:sysTime > startTime
        },
        ready: function () {
            var _this = this;
            _this.pageLoading = false;
            if(_this.isLogin && _this.isTime){
                //投资的金额
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/queryData.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'draw_pic'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        _this.money = data.resultData.investSum;
                    }
                });
            }
            shareInit({
                isApp: base.isApp,
                dataUrl: "",
                imgUrl: shareImg,
                shareLink: base.urlQuery(shareCurPage.url,''),
                curLink: curPageUrl,
                title: shareCurPage.title,
                desc: shareCurPage.desc,
                type: ""
            });
        },
        methods: {
            gotologin:function(){
                //登入
                base.gotoLogin();
            }
        }
    })
})