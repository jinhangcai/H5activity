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


    var activityCode = '20160718',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate,     //开始时间
        endTime = startTime + 6*86400000,
        integral = activityData.integral,
        isGreedyDay = sysTime >= startTime + 3*86400000,
        isGreedyDayAfter = sysTime >= startTime + 4*86400000;

    // 页面需要登陆验证
    if(!userPhone){
        base.gotoLogin();
        return false;
    }

    // 日期月日
    Vue.filter('showDate', function (time) {
        var date = new Date(time),
            mouth = date.getMonth() + 1,
            day = date.getDate();

        return mouth + '.' + day;
    });

    // 奖励文案
    Vue.filter('showPrize', function (point) {
        var text = '';
        if(point === 5){
            text = '160元红包'
        }else if(point >= 28){
            text = '90元红包'
        }else if(point >= 24){
            text = '40元红包'
        }else if(point >= 20){
            text = '12元红包'
        }else{
            text = '无'
        }
        return text;
    });

//------------------------------------------------------------[页面逻辑]
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,
            isLogin: !!userPhone,
            isStart: sysTime > startTime,
            isEnd: sysTime > endTime,
            isGreedyDay: isGreedyDay,
            isGreedyDayAfter: isGreedyDayAfter,
            isEmpty: true,
            totalPrize: 0,
            prizeGoods: '',
            integral: integral,
            listData: []
        },
        ready: function () {
            var that = this;

            if(!this.isStart){
                that.pageLoading = false;
                return false;
            }
            // 公共中奖列表
            $.ajax({
                url: pageUrl.myPrice.url,
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
                success: function (data) {
                    if(data.resultCode === 1){
                        that.listData = data.resultData.lotteryWinList;
                        if(that.listData.length > 0){
                            that.isEmpty = false;

                            var num = 0;
                            for(var i = 0, l = that.listData.length; i < l; i++){
                                num += pointToNum(that.listData[i].point);
                            }
                            that.totalPrize = num;
                            if(that.isGreedyDayAfter){
                                that.prizeGoods = goodsResult(data.resultData.integral);
                            }
                        }
                    }

                    that.pageLoading = false;
                }
            });
        },
        methods: {

        }
    });

    // 摇实物奖品
    function goodsResult(point){
        var text = '';
        if(point > 4588){
            text = '飞利浦意式咖啡机'
        }else if(point > 2888){
            text = '3D高清投影仪'
        }else if(point > 1888){
            text = '京东E卡500元'
        }else if(point > 1088){
            text = '蒸汽电动拖把'
        }else if(point > 688){
            text = '冰丝凉席三件套'
        }else if(point > 288){
            text = '全自动酸奶机'
        }else if(point >= 160){
            text = '迷你风扇'
        }
        return text !== '' ? '、'+text : text;
    }

    // 点数对应的红包金额
    function pointToNum(point) {
        var num;
        if(point === 5){
            num = 160
        }else if(point >= 28){
            num = 90
        }else if(point >= 24){
            num = 40
        }else if(point >= 20){
            num = 12
        }else{
            num = 0
        }
        return num;
    }
//------------------------------------------------------------[分享]
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '最牛的摇骰子游戏，摇出“5个1”，惊喜好礼火爆来袭~',
        desc: '想做大赢家就来幸运骰子摇一摇，看到的朋友都忍不住尝试了！',
        url: base.switchUrl('m' + activityCode + '/index')
    };

    function shareEvent() {
        shareInit({
            isApp: base.isApp,
            dataUrl: "",
            imgUrl: shareImg,
            shareLink:shareCurPage.url,
            curLink: curPageUrl,
            title: shareCurPage.title,
            desc: shareCurPage.desc,
            type: ""
        });
    }

    shareEvent();
});