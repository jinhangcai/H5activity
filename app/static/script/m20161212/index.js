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


    var activityCode = '20161212',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        part3StartTime = activityData.allLinkTime[2].startTime,      //12号投资环节开始时间
        endTime = activityData.endDate,
        startTime = activityData.startDate;     //开始时间

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '1212剁手日，来钱庄抢钱抢大礼， 不一样的买买买！',
        desc: '快瞧，又一波剁手季的理财福利，双十二赶快接招！',
        url: base.switchUrl('m' + activityCode + '/index')
    };

//------------------------------------------------------------[页面逻辑]
    Vue.filter('date', function (value) {
        var date = new Date(value),
            year = date.getFullYear(),
            month = date.getMonth() + 1;
        return year+'年'+month+'月';
    });
    Vue.filter('secretPhone', function (value) {
        return value.replace(/(\d{3})\d+(\d{4})/g, '$1****$2');
    });
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,
            isLogin: !!userPhone,
            isStart: sysTime >= startTime,
            isEnd: sysTime > endTime,
            isPart3start: sysTime >= part3StartTime,
            alertMask: false,
            alertContent: '',
            couponUsedTimes: 0,
            couponList: [{
                able: true
            },{
                able: true
            },{
                able: true
            }],
            limitTopList: [],
            userTotal: 0,
            isIOSApp: base.isApp && base.isIOS()
        },
        ready: function () {
            var that = this;
            if(this.isStart && this.isLogin){
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/queryDataOf20161212.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.couponUsedTimes = data.resultData.link2_totalTimes;
                            that.limitTopList = data.resultData.link3_list;
                            that.userTotal = data.resultData.link3_personalAll;

                            if(that.couponUsedTimes > 0){
                                for(var i = 0; i<that.couponUsedTimes; i++){
                                    that.couponList[i].able = false;
                                }
                            }
                        }else{
                            console.log(data.resultMsg);
                        }
                    }
                });
            }
            this.pageLoading = false;

        },
        methods: {
            closeAlert: function(){
                this.alertContent = '';
                this.alertMask = false;
            },
            openAlert: function(content){
                this.alertContent = content;
                this.alertMask = true;
            },
            goLogin: function(){
                base.gotoLogin();
            },
            receiveCoupon: function(i, able){
                if(!this.isStart){
                    this.openAlert('12月8日才开始哦~');
                    return false;
                }
                if(this.isEnd){
                    this.openAlert('活动已结束了哦~');
                    return false;
                }
                if(!this.isLogin){
                    this.goLogin();
                    return false;
                }
                if(!able){
                    return false;
                }
                var that = this;
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/receiveCouponOf20161212.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if(data.resultCode == 1){
                            that.couponList[i].able = false;
                        }else{
                            // （NO_AVAILABLE_TENDER:没有投资大于5000; TODAY_CHANCE_IS_OVER:今日已领取; TOTAL_CHANCE_IS_OVER:总次数已用
                            var content = '';
                            switch(data.errorCode){
                                case 'NO_AVAILABLE_TENDER':
                                    content = '单笔投资满5000元才可领取';
                                    break;
                                case 'TODAY_CHANCE_IS_OVER':
                                    content = '每天限领1张哦~';
                                    break;
                                case 'TOTAL_CHANCE_IS_OVER':
                                    content = '总次数已用完';
                                    break;
                                case 'OUT_OF_ACTIVITY':
                                    content = '不在活动期间！';
                                    break;
                            }
                            if(content){
                                that.openAlert(content);
                            }
                            console.log(data.resultMsg);
                        }
                    }
                });
            },
            goGame: function(){
                base.checkAppEvent(base.switchUrl('m20161212/drawnGame'), '1+2拆红包 比手气')
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