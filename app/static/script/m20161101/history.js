define(function (require) {
    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
        pageUrl = require('url-map'),
        base = require('base'),
        loadList = require('loadList'),
        Vue = require('vue');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);


    var activityCode = '20161101',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate;     //开始时间

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '还嫌工资不够花？该试试工资拯救计划了！',
        desc: '工资低不要紧，钱庄每月给你发拯救资金！',
        url: base.switchUrl('m' + activityCode + '/index')
    };

//------------------------------------------------------------[页面逻辑]
    Vue.filter('date', function (value) {
        var date = new Date(value),
            year = date.getFullYear(),
            month = date.getMonth() + 1;
        return year+'年'+month+'月';
    });
    new Vue({
        el: 'body',
        data: {
            pageLoading: false,
            isLogin: !!userPhone,
            isStart: sysTime >= startTime,
            startTime: startTime,
            list: [],
            loading: false,
            isIOSApp: base.isApp && base.isIOS()
        },
        ready: function () {
            var that = this;
                that.pageLoading = true;
            if(that.isStart && that.isLogin){
                new loadList({
                    wrap:  $('.viewport')[0],
                    loadStart: function(){
                        that.loading = true;
                    },
                    loadEnd: function(){
                        that.loading = false;
                    },
                    ajax: {
                        url: pageUrl.apiUrl.url + '/activity/monthlyActivity/queryDataOfSaveWages.html',
                        type: "post",
                        data: {
                            oauthToken: base.token,
                            native_view: (base.isApp ? 'app' : ''),
                            activityCode: activityCode
                        },
                        success: function (data, next) {
                            if(data.resultCode === 1){
                                var list = data.resultData.list,
                                    len = list.length;
                                for(var i = 0; i<len; i++){
                                    that.list.push(list[i])
                                }
                                setTimeout(next, 500)
                            }else{
                                console.log(data.resultMsg)
                            }
                        }
                    }
                });
            }

            this.pageLoading = false;

        },
        methods: {
            goLogin: function(){
                base.gotoLogin();
            },
            goHistory: function(){
                base.checkAppEvent(base.switchUrl('m20161101/history'), '历史记录')
            },
            goInvest: function(){
                base.gotoProductList();
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